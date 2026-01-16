import { defineConfig, splitVendorChunkPlugin } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const host = process.env.TAURI_DEV_HOST;

const devPort = 2026;

export default defineConfig({
    build: {
        outDir: 'build/vite',
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name][extname]',
                chunkFileNames: '[name]-[hash].js',
                entryFileNames: 'main.js',
            },
        },

        target:
            process.env.TAURI_ENV_PLATFORM == 'windows'
                ? 'chrome105'
                : 'safari13',
        // don't minify for debug builds
        minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
        // produce sourcemaps for debug builds
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
    },
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_ENV_'],
    experimental: {
        renderBuiltUrl(filename: string) {
            // If there is a proxy URL this means that is running outside of Liferay

            return process.env.TAURI_ENV_PROXY_BASE_URL
                ? filename
                : `/o/object-visualizer-custom-element/${filename}`;
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: devPort,
        origin: `http://localhost:${devPort}`,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                  protocol: 'ws',
                  overlay: false,
                  host,
                  port: 1421,
              }
            : {
                  overlay: false,
              },

        watch: {
            ignored: ['**/src-tauri/**'],
        },
    },
    plugins: [
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
        splitVendorChunkPlugin(),
    ],
});
