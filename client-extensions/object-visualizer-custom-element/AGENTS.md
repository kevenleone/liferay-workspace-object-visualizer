# AGENTS.md - Instructions for Coding Agents

## Project Overview

This is a React + TypeScript custom element for browsing and querying Liferay Objects. It runs in the browser, renders inside a Shadow DOM, and interoperates with a local Tauri server that proxies requests to Liferay with support for Basic, Bearer, and OAuth2 client-credentials.

## Technology Stack

- **Frontend**: React 19, TypeScript, TanStack Router (hash history)
- **Styling**: Tailwind CSS (adopted stylesheet into Shadow DOM), shadcn/ui components
- **Backend**: Tauri server at `127.0.0.1:2027` with global environment persistence
- **Data**: liferay-headless-rest-client configured to use either Liferay's own fetch or the local Tauri proxy
- **Testing**: Vitest with jsdom environment
- **Build**: Vite with React SWC, TanStack Router plugin

## Development Commands

- `npm run dev`: Start Vite dev server (web)
- `npm run build`: Build the web bundle
- `npm run preview`: Preview the built bundle
- `npm run lint`: Run ESLint
- `npm run test`: Run Vitest tests
- `npm run test:coverage`: Run Vitest with coverage
- `npm run tauri:dev`: Run Tauri CLI dev flow
- `npm run tauri:build`: Build desktop app

## Coding Conventions

- **Imports**: Use `import/order` with `newlines-between: 'always'`
- **Object keys**: Use `sort-keys/sort-keys-fix` with ascending order, case insensitive
- **TypeScript**: `@typescript-eslint/no-explicit-any` is disabled (allowed)
- **React**: Follow `react-hooks` recommended rules
- **File structure**: Components in `src/components/`, routes in `src/routes/`, utilities in `src/lib/`

## Architecture Notes

- Custom element defined in `src/main.tsx`
- Router config in `src/core/tanstack-router.tsx`
- Environment setup in `src/components/environment-setup.tsx`
- Data clients in `src/lib/headless-client.ts` and `src/lib/tauri-client.ts`
- Proxy routes: `POST /applications`, `PUT /applications`, `GET /applications`, `GET|POST /proxy/*`
- Auth support: Basic, Bearer, OAuth2 (client credentials with token caching)

## Development Tips

- Ensure `TAURI_ENV_PROXY_BASE_URL` matches Tauri server location (defaults to `http://localhost:2027`)
- Select an environment in `/environments` before browsing objects
- Use `router.invalidate()` to force route loaders to re-run on environment changes
- Shadow DOM app with adopted stylesheet for styling isolation

## Testing Approach

- Write tests in Vitest with jsdom environment
- Tests located in `src/**/__tests__/` directories
- Use `npm run test:coverage` for coverage reports

## To avoid

Avoid running bun tauri:build or bun tauri:dev unless requested
