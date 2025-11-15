import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { KiwiVitePlugin } from '@i18nflow/kiwi/plugin-vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    KiwiVitePlugin({
      enabled: true,
      i18nIdentifier: 'I18N',
      localeDir: 'src/locales',
      locales: ['zh-CN', 'en-US'],
      fileExtension: '.ts',
      autoProxy: true,
    }),
  ],
  server: {
    port: 3020,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
