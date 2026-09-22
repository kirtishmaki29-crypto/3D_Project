import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/portfolio.css', 'resources/js/portfolio.js'],
            refresh: true,
        }),
    ],
});
