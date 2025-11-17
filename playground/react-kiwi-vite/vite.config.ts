import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { KiwiVitePlugin } from '@i18nflow/kiwi/plugin-vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // 🔥 Kiwi I18N 可视化调试插件（仅开发环境）
    command === 'serve' &&
      KiwiVitePlugin({
        i18nIdentifier: 'I18N',
        localeDir: 'src/locales',
        locales: ['zh-CN', 'en-US'],
        fileExtension: '.ts',
        autoProxy: true,
      }),
  ].filter(Boolean),
  server: {
    port: 3020,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}));
