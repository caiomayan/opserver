import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  base: '/OpServer/',
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
        main: './main.html',
        servers: './servers.html',
      },
    },
  },
  define: {
    // Substitui placeholders em tempo de build com variáveis de ambiente
    // Fornecendo valores vazios como fallback se não estiverem definidos
    'process.env.STEAM_API_KEY': JSON.stringify(process.env.STEAM_API_KEY || ''),
    'process.env.SERVER_IP': JSON.stringify(process.env.SERVER_IP || '127.0.0.1'),
    'process.env.SERVER_PORT': JSON.stringify(process.env.SERVER_PORT || '27015'),
  },
});

