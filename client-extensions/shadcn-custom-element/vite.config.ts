import { defineConfig, splitVendorChunkPlugin } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

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
    },
    experimental: {
        renderBuiltUrl(filename: string) {
            return `/o/shadcn-custom-element/${filename}`;
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
