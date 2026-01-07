FROM oven/bun:1.1-alpine AS base
WORKDIR /app

FROM base AS dev
COPY package*.json ./
RUN bun install
COPY . .
EXPOSE 5173
ENV TAURI_ENV_PROXY_BASE_URL=http://host.docker.internal:3001
ENV TAURI_DEV_HOST=0.0.0.0
ENV CHOKIDAR_USEPOLLING=1
ENV WATCHPACK_POLLING=true
CMD ["bun","run","dev"]

FROM base AS builder
COPY package*.json ./
RUN bun install
COPY . .
ARG TAURI_ENV_PROXY_BASE_URL=http://localhost:3001
ENV TAURI_ENV_PROXY_BASE_URL=${TAURI_ENV_PROXY_BASE_URL}
ENV TAURI_BUILD=true
RUN bun run build

FROM nginx:alpine AS prod
COPY --from=builder /app/build/vite /usr/share/nginx/html
EXPOSE 80
