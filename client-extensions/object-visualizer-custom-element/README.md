# Object Visualizer Custom Element

A React + TypeScript custom element for browsing and querying Liferay Objects. It runs in the browser, renders inside a Shadow DOM, and interoperates with a local Tauri server that proxies requests to Liferay with support for Basic, Bearer, and OAuth2 client-credentials.

## Overview
- Custom element: `object-visualizer-custom-element`, defined in `src/main.tsx`
- UI/Router: React with TanStack Router (hash history)
- Styling: Tailwind CSS (adopted stylesheet into Shadow DOM)
- Icons/Components: lucide-react, shadcn-inspired UI
- Data: liferay-headless-rest-client configured to use either Liferay’s own fetch or the local Tauri proxy
- Proxy: local Tauri server at `127.0.0.1:3001` with global environment persistence

## Architecture
- Shadow DOM app bootstrapped in `src/main.tsx`
- Router config in `src/core/tanstack-router.tsx`
  - Default pending overlay (`defaultPendingComponent`) for route transitions
- Feature routes under `src/routes`
  - `/environments`: setup and selection of remote targets
  - `/p`: object browsing, schema, and query
  - Nested routes load data via TanStack Router loaders
- Tauri backend (`src-tauri/src/server.rs`)
  - Stores environments in `~/.object-visualizer/applications.json`
  - Proxies requests under `/proxy/*` and forwards query params
  - Authorization: Basic, Bearer, OAuth2 (client credentials with token caching)

## Tooling
- Build/dev: Vite with React SWC
- Router plugin: `@tanstack/router-plugin/vite` for file-based routes
- Lint: ESLint
- Desktop packaging: Tauri CLI and config in `src-tauri/tauri.conf.json`

## Commands
From this directory:
- `npm run dev`: start the Vite dev server (web)
- `npm run build`: build the web bundle
- `npm run preview`: preview the built bundle
- `npm run lint`: run ESLint
- `npm run tauri`: run Tauri CLI (dev/build flows controlled by `tauri.conf.json`)
- `npm run tauri:build`: build desktop app (invokes Vite build via Tauri hooks)

## Configuration
- Env prefix: `VITE_` and `TAURI_ENV_*` are exposed to the client via Vite
- Proxy base URL:
  - `TAURI_ENV_PROXY_BASE_URL` controls the base URL used by our Tauri client helpers
  - Defaults to `http://localhost:3001` if unset
  - Example:
    - macOS/zsh: `TAURI_ENV_PROXY_BASE_URL=http://localhost:3001 npm run dev`
    - Windows PowerShell: `$env:TAURI_ENV_PROXY_BASE_URL='http://localhost:3001'; npm run dev`

## Environment Handling
- Saved environments live in `~/.object-visualizer/applications.json` (created automatically)
- UI for add/edit/select in `src/components/environment-setup.tsx`
- On selection:
  - Environment info written to localStorage under `StorageKeys.SELECTED_ENVIRONMENT_INFO`
  - `liferayClient.setConfig(getClientOptions())` updates headers (including `x-target-id`)
  - `router.invalidate()` forces route loaders to re-run immediately with the updated configuration

## Data Client
- `src/lib/headless-client.ts`
  - If inside Liferay: uses `Liferay.Util.fetch` with baseUrl `/`
  - If external: uses proxy base URL `${TAURI_ENV_PROXY_BASE_URL}/proxy` and sets `x-target-id`
- `src/lib/tauri-client.ts`
  - Helpers: `tauriUrl`, `tauriFetch`, `tauriJson`
  - Centralizes usage of `TAURI_ENV_PROXY_BASE_URL`

## Proxy Server (Tauri)
- Listens on `127.0.0.1:3001`
- Routes:
  - `POST /applications` to add environment
  - `PUT /applications` to update environment
  - `GET /applications` to list environments
  - `GET|POST /proxy/*path` forwards to target host, preserves query string
- Auth:
  - `basic`: encodes `username:password`
  - `bearer`: uses provided token
  - `oauth`/`oauth2`: exchanges client credentials at `tokenUrl`, caches token until expiry

## Routing UX
- Pending overlay for any route loader activity via TanStack Router’s `defaultPendingComponent`
- Keep the UI responsive during data fetching and transitions

## Development Tips
- Ensure `TAURI_ENV_PROXY_BASE_URL` matches where the Tauri server runs
- Select an environment in `/environments` before browsing objects
- If loaders appear stale, `router.invalidate()` is already wired to run on environment selection

## Linting
- `npm run lint`
- Some warnings about “only-export-components” are informational and do not block dev

## Packaging
- Desktop builds via `npm run tauri:build`
- Vite outputs are configured for Tauri in `vite.config.ts` (build paths, assets)

## Troubleshooting
- Proxy not reachable: confirm server logs show “Server listening on 127.0.0.1:3001”
- OAuth2 failures: verify `clientId`, `clientSecret`, and `tokenUrl` in the environment config
- Missing data: reselect environment or check that `x-target-id` is set in client config
