import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  base: '/opserver/',
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
        main: './main.html',
        servers: './servers.html',
        about: './about.html',
      },
    },
  },
});
