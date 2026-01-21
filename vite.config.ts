import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

const host = process.env.TAURI_DEV_HOST;

const devPort = 2026;

export default defineConfig({
    build: {
        // don't minify for debug builds
        minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
        outDir: 'build/vite',

        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name][extname]',
                chunkFileNames: '[name]-[hash].js',
                entryFileNames: 'main.js',
            },
        },
        // produce sourcemaps for debug builds
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
        target:
            process.env.TAURI_ENV_PLATFORM == 'windows'
                ? 'chrome105'
                : 'safari13',
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
    plugins: [
        tanstackRouter({
            autoCodeSplitting: true,
            target: 'react',
        }),
        react(),
        tailwindcss(),
        splitVendorChunkPlugin(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        hmr: host
            ? {
                  host,
                  overlay: false,
                  port: 1421,
                  protocol: 'ws',
              }
            : {
                  overlay: false,
              },
        host: host || false,
        origin: `http://localhost:${devPort}`,
        port: devPort,
        strictPort: true,

        watch: {
            ignored: ['**/src-tauri/**'],
        },
    },

    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test-setup.ts',
    },
});
