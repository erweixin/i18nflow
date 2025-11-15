/** @type {import('next').NextConfig} */
const { ReactI18nextNextPlugin } = require('@i18nflow/react-i18next/plugin-next');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { dev, isServer }) => {
    // 只在开发环境的客户端启用 i18nflow 调试插件
    if (dev && !isServer) {
      console.log('🔍 Adding React-i18next debug plugin...');

      config.plugins.push(
        new ReactI18nextNextPlugin({
          localeDir: 'src/i18n/locales',
          locales: ['zh-CN', 'en-US'],
          defaultNs: 'common',
        })
      );

      console.log('✅ Plugin added, rules count:', config.module.rules.length);
    }
    return config;
  },
};

module.exports = nextConfig;
