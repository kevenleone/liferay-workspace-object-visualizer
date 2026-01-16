# Liferay Workspace: Object Visualizer

A workspace hosting the Object Visualizer custom element and its Tauri proxy. The custom element provides a UI for browsing and querying Liferay Objects. The Tauri backend proxies requests and persists environment configurations globally on the machine.

## Structure

- Root workspace: npm workspaces and Gradle/Liferay Workspace structure
- App code:
    - client-extensions/object-visualizer-custom-element
        - React + TanStack Router + Tailwind
        - Tauri backend server (Rust) for proxy and persistence

## Key Components

- Custom element: renders inside a Shadow DOM, defined in `client-extensions/object-visualizer-custom-element/src/main.tsx`
- Router: `@tanstack/react-router` with generated `routeTree.gen.ts`
- UI: shadcn-inspired components, lucide-react icons, Tailwind CSS
- Data client: `liferay-headless-rest-client` driven via `src/lib/headless-client.ts`
- Proxy server: `src-tauri/src/server.rs`, listens on `127.0.0.1:2027`

## Tauri Proxy Features

- Global environment persistence at `~/.object-visualizer/applications.json`
- Endpoints:
    - `GET /applications`: list environments
    - `POST /applications`: add environment
    - `PUT /applications`: update environment
    - `GET|POST /proxy/*`: forward requests to the selected environment, preserving query params
- Authentication:
    - Basic: encodes `username:password`
    - Bearer: uses a static token
    - OAuth2: client credentials flow using `tokenUrl`, caches token until expiry

## Environment Selection Flow

- Managed by `EnvironmentSetup` in the custom element
- Writes the selected environment to localStorage
- Updates `liferayClient` config and invalidates the router to refetch data immediately

## Tooling

- Frontend: Vite + React SWC
- Router plugin: `@tanstack/router-plugin/vite` (file-based routes)
- Lint: ESLint
- Desktop: Tauri CLI

## Commands

- Frontend (from `client-extensions/object-visualizer-custom-element`):
    - `npm run dev`: web dev server
    - `npm run build`: web build
    - `npm run lint`: lint
    - `npm run preview`: preview build
    - `npm run tauri`: Tauri CLI
    - `npm run tauri:build`: desktop build

## Configuration

- Client-side env prefixes: `VITE_` and `TAURI_ENV_*`
- Proxy base URL: `TAURI_ENV_PROXY_BASE_URL`
    - Default: `http://localhost:2027`
    - Example:
        - macOS/zsh: `TAURI_ENV_PROXY_BASE_URL=http://localhost:2027 npm run dev`
        - Windows PowerShell: `$env:TAURI_ENV_PROXY_BASE_URL='http://localhost:2027'; npm run dev`

## Development Notes

- Ensure the Tauri server is running or reachable on `127.0.0.1:2027`
- Select an environment before navigating the object pages
- Router pending overlay shows a loading state during route transitions

## Troubleshooting

- No environments: create one in `/environments`
- OAuth2 errors: verify `clientId`, `clientSecret`, `tokenUrl`
- Stale data: environment selection triggers router invalidation; confirm it executed
