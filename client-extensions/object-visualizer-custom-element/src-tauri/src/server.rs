use axum::{
    body::{Body, Bytes},
    extract::{OriginalUri, Path, State},
    http::{HeaderMap, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::{delete, get, patch, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Read;
use std::path::PathBuf;
use std::time::{Duration, Instant};
use std::sync::{Arc, Mutex};
use tower_http::cors::CorsLayer;
use base64::{engine::general_purpose, Engine as _};

fn get_db_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    let dir = PathBuf::from(home).join(".object-visualizer");
    
    dir.join("applications.json")
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Application {
    pub id: Option<String>,
    pub name: Option<String>,
    #[serde(flatten)]
    pub extra: serde_json::Value,
}

#[derive(Serialize, Deserialize, Debug)]
struct SanitizedApplication {
    id: Option<String>,
    name: Option<String>,
    #[serde(flatten)]
    extra: serde_json::Value,
}

#[derive(Serialize, Deserialize, Debug)]
struct Database {
    environments: Vec<Application>,
}

#[derive(Clone)]
pub struct AppState {
    pub applications: Arc<Mutex<Vec<Application>>>,
    pub client: reqwest::Client,
    pub token_cache: Arc<Mutex<HashMap<String, OAuthToken>>>,
}

#[derive(Clone)]
struct OAuthToken {
    authorization: String,
    expires_at: Instant,
}

pub async fn start_server() {
    let applications = load_applications();
    let state = AppState {
        applications: Arc::new(Mutex::new(applications)),
        client: reqwest::Client::new(),
        token_cache: Arc::new(Mutex::new(HashMap::new())),
    };

    let app = Router::new()
        .route(
            "/applications",
            post(add_application).get(get_applications).put(update_application),
        )
        .route("/applications/:id", get(get_application).delete(delete_application))
        .route(
            "/proxy/*path",
            delete(
                |State(state), Path(path), OriginalUri(original_uri), headers: HeaderMap| async move {
                    let query = original_uri.query().map(|s| s.to_string());
                    forward(state, path, Method::DELETE, headers, Bytes::new(), query).await
                },
            ).get(
                |State(state), Path(path), OriginalUri(original_uri), headers: HeaderMap| async move {
                    let query = original_uri.query().map(|s| s.to_string());
                    forward(state, path, Method::GET, headers, Bytes::new(), query).await
                },
            )
            .patch(
                |State(state), Path(path), OriginalUri(original_uri), headers: HeaderMap, body: Bytes| async move {
                    let query = original_uri.query().map(|s| s.to_string());
                    forward(state, path, Method::PATCH, headers, body, query).await
                },
            ).post(
                |State(state), Path(path), OriginalUri(original_uri), headers: HeaderMap, body: Bytes| async move {
                    let query = original_uri.query().map(|s| s.to_string());
                    forward(state, path, Method::POST, headers, body, query).await
                },
            )
            ,
        )
        .layer(CorsLayer::permissive())
        .with_state(state);

    let addr = "127.0.0.1:2027";
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Server listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

fn load_applications() -> Vec<Application> {
    let db_path = get_db_path();
    if let Ok(mut file) = File::open(db_path) {
        let mut content = String::new();
        if file.read_to_string(&mut content).is_ok() {
            if let Ok(db) = serde_json::from_str::<Database>(&content) {
                return db.environments;
            }
        }
    }
    Vec::new()
}

fn save_applications(applications: &[Application]) {
    let db = Database {
        environments: applications.to_vec(),
    };
    if let Ok(json) = serde_json::to_string_pretty(&db) {
        let db_path = get_db_path();
        if let Some(parent) = db_path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        let _ = fs::write(db_path, json);
    }
}

async fn add_application(
    State(state): State<AppState>,
    Json(payload): Json<Application>,
) -> impl IntoResponse {
    let mut apps = state.applications.lock().unwrap();
    apps.push(payload);
    save_applications(&apps);
    StatusCode::CREATED
}

async fn get_applications(State(state): State<AppState>) -> Json<Vec<SanitizedApplication>> {
    let apps = state.applications.lock().unwrap().clone();
    let sanitized: Vec<SanitizedApplication> = apps.into_iter().map(|app| {
        let mut extra = app.extra;
        if let Some(obj) = extra.as_object_mut() {
            obj.remove("clientSecret");
            obj.remove("password");
            obj.remove("token");
        }
        SanitizedApplication {
            id: app.id,
            name: app.name,
            extra,
        }
    }).collect();
    Json(sanitized)
}

async fn get_application(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Application>, StatusCode> {
    let apps = state.applications.lock().unwrap();
    if let Some(app) = apps.iter().find(|app| app.id.as_deref() == Some(&id)) {
        Ok(Json(app.clone()))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn update_application(
    State(state): State<AppState>,
    Json(payload): Json<Application>,
) -> Result<Json<Application>, StatusCode> {
    let mut apps = state.applications.lock().unwrap();
    if let Some(index) = apps
        .iter()
        .position(|app| app.id == payload.id && app.id.is_some())
    {
        apps[index] = payload.clone();
        save_applications(&apps);
        Ok(Json(payload))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn delete_application(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let mut apps = state.applications.lock().unwrap();
    if let Some(pos) = apps.iter().position(|app| app.id.as_deref() == Some(&id)) {
        apps.remove(pos);
        save_applications(&apps);
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn forward(
    state: AppState,
    path: String,
    method: Method,
    headers: HeaderMap,
    body: Bytes,
    query: Option<String>,
) -> Result<Response, StatusCode> {
    let target_id = headers
        .get("x-target-id")
        .and_then(|h| h.to_str().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let application = {
        let apps = state.applications.lock().unwrap();
        apps.iter()
            .find(|app| app.id.as_deref() == Some(target_id))
            .cloned()
    }
    .ok_or(StatusCode::NOT_FOUND)?;

    println!("{:#?}", application);
    println!("Printing metadata");
    println!("{:#?}", path);
    println!("{:#?}", method);

    if method == Method::POST {
        println!("{:#?}", body);
    }

    let protocol = application
        .extra
        .get("protocol")
        .and_then(|v| v.as_str())
        .unwrap_or("http");
    let host = application
        .extra
        .get("host")
        .and_then(|v| v.as_str())
        .ok_or(StatusCode::BAD_REQUEST)?;
    let port = application
        .extra
        .get("port")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    let base = if port.is_empty() {
        format!("{}://{}", protocol, host)
    } else {
        format!("{}://{}:{}", protocol, host, port)
    };

    let base = base.trim_end_matches('/');
    let url = if let Some(q) = query {
        format!("{}/{}?{}", base, path, q)
    } else {
        format!("{}/{}", base, path)
    };
    
    let mut req_builder = state.client.request(method, &url);
    
    for (key, value) in headers.iter() {
        if key.as_str().eq_ignore_ascii_case("host")
            || key.as_str().eq_ignore_ascii_case("x-target-id")
            || key.as_str().eq_ignore_ascii_case("x-target-url")
            || key.as_str().eq_ignore_ascii_case("authorization")
        {
            continue;
        }
        req_builder = req_builder.header(key, value);
    }

    let auth_type = application
        .extra
        .get("authType")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    if auth_type.eq_ignore_ascii_case("basic") {
        let username = application
            .extra
            .get("username")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        let password = application
            .extra
            .get("password")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        if !username.is_empty() || !password.is_empty() {
            let creds = format!("{}:{}", username, password);
            let encoded = general_purpose::STANDARD.encode(creds.as_bytes());
            req_builder = req_builder.header("Authorization", format!("Basic {}", encoded));
        }
    } else if auth_type.eq_ignore_ascii_case("bearer") {
        if let Some(token) = application.extra.get("token").and_then(|v| v.as_str()) {
            if !token.is_empty() {
                req_builder = req_builder.header("Authorization", format!("Bearer {}", token));
            }
        }
    } else if auth_type.eq_ignore_ascii_case("oauth") || auth_type.eq_ignore_ascii_case("oauth2") {
        let client_id = application
            .extra
            .get("clientId")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        let client_secret = application
            .extra
            .get("clientSecret")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        let token_url = application
            .extra
            .get("tokenUrl")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        if !client_id.is_empty() && !client_secret.is_empty() && !token_url.is_empty() {
            let cached = {
                let cache = state.token_cache.lock().unwrap();
                cache.get(target_id).cloned()
            };
            let now = Instant::now();
            let mut authorization: Option<String> = None;
            if let Some(token) = cached {
                if now < token.expires_at {
                    authorization = Some(token.authorization);
                }
            }
            if authorization.is_none() {
                println!("{} Authorization is blank, requesting for new authorization token {}: ", path, client_id);

                let params = [("client_id", client_id), ("client_secret", client_secret), ("grant_type", "client_credentials")];
                let res = state
                    .client
                    .post(token_url)
                    .form(&params)
                    .send()
                    .await
                    .map_err(|_| StatusCode::BAD_GATEWAY)?;
                #[derive(Deserialize)]
                struct OAuthResponse {
                    access_token: String,
                    token_type: String,
                    expires_in: u64,
                }
                let data: OAuthResponse = res.json().await.map_err(|_| StatusCode::BAD_GATEWAY)?;

                println!("{} Exchanged authorization for {}: ", path, client_id);

                let auth_value = format!("{} {}", data.token_type, data.access_token);
                let expires_at = Instant::now() + Duration::from_millis(data.expires_in.saturating_mul(1000).saturating_sub(15000));
                {
                    let mut cache = state.token_cache.lock().unwrap();
                    cache.insert(
                        target_id.to_string(),
                        OAuthToken {
                            authorization: auth_value.clone(),
                            expires_at,
                        },
                    );
                }
                authorization = Some(auth_value);
            }
            if let Some(auth) = authorization {
                req_builder = req_builder.header("Authorization", auth);
            }
        }
    }

    req_builder = req_builder.body(body);

    match req_builder.send().await {
        Ok(res) => {
            let status = res.status();
            let headers = res.headers().clone();
            let body = Body::from_stream(res.bytes_stream());
            
            let mut response = Response::builder().status(status);
            *response.headers_mut().unwrap() = headers;
            Ok(response.body(body).unwrap())
        }
        Err(_) => Err(StatusCode::BAD_GATEWAY),
    }
}
