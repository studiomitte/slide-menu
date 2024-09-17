import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    root: 'src',
    build: {
        outDir: '../dist',
        assetsDir: '../dist',
        rollupOptions: {
            input: {
                "slide-menu": './src/lib/SlideMenu.min.ts',
            },
            output: {
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        host: '0.0.0.0',
        port: 8080,
    },
});
