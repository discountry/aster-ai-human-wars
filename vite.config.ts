import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const classicScriptPlugin = () => ({
  name: 'force-classic-script-output',
  transformIndexHtml(html, ctx) {
    if (!ctx?.bundle) {
      return html;
    }

    return html
      .replace(/\s+type=["']module["']/g, '')
      .replace(/<script([^>]*?)\bcrossorigin/g, '<script$1 defer crossorigin');
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), classicScriptPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          format: 'iife',
          name: 'TradingWarsApp',
          entryFileNames: 'assets/app.[hash].js',
        },
      },
    },
  };
});
