import { defineConfig, splitVendorChunkPlugin } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const host = process.env.TAURI_DEV_HOST;
const tauriBuild = process.env.TAURI_BUILD;

const devPort = 5173;

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
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    experimental: {
        renderBuiltUrl(filename: string) {
            return tauriBuild
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
                  host,
                  port: 1421,
              }
            : undefined,

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
