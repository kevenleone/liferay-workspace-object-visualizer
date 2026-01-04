use axum::{
    body::Body,
    extract::{Query, State},
    http::{HeaderMap, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::{any, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tower_http::cors::CorsLayer;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Application {
    pub id: Option<String>,
    pub name: Option<String>,
    #[serde(flatten)]
    pub extra: serde_json::Value,
}

#[derive(Clone)]
pub struct AppState {
    pub applications: Arc<Mutex<Vec<Application>>>,
    pub client: reqwest::Client,
}

#[derive(Deserialize)]
struct ProxyParams {
    url: String,
}

pub async fn start_server() {
    let state = AppState {
        applications: Arc::new(Mutex::new(Vec::new())),
        client: reqwest::Client::new(),
    };

    let app = Router::new()
        .route("/applications", post(add_application).get(get_applications))
        .route("/proxy", any(proxy_handler))
        .layer(CorsLayer::permissive())
        .with_state(state);

    // Using port 3001 to avoid conflict with default frontend ports
    let addr = "127.0.0.1:3001";
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Server listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn add_application(
    State(state): State<AppState>,
    Json(payload): Json<Application>,
) -> impl IntoResponse {
    state.applications.lock().unwrap().push(payload);
    StatusCode::CREATED
}

async fn get_applications(State(state): State<AppState>) -> Json<Vec<Application>> {
    let apps = state.applications.lock().unwrap().clone();
    Json(apps)
}

async fn proxy_handler(
    State(state): State<AppState>,
    Query(params): Query<ProxyParams>,
    method: Method,
    headers: HeaderMap,
    body: Body,
) -> Result<Response, StatusCode> {
    let url = params.url;
    
    let body_bytes = axum::body::to_bytes(body, usize::MAX).await.map_err(|_| StatusCode::BAD_REQUEST)?;

    let mut req_builder = state.client.request(method, &url);
    
    for (key, value) in headers {
         if let Some(key) = key {
             if key.as_str().eq_ignore_ascii_case("host") {
                 continue;
             }
             req_builder = req_builder.header(key, value);
         }
    }

    req_builder = req_builder.body(body_bytes);

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
