/** @type {import('next').NextConfig} */
const { ReactI18nextNextPlugin } = require('@i18nflow/react-i18next/plugin-next');
const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { dev, isServer }) => {
    // 在开发环境的服务端和客户端都启用 i18nflow 调试插件
    // 这确保服务端和客户端使用相同的转换逻辑，避免 hydration 错误
    if (dev) {
      console.log(`🔍 Adding React-i18next debug plugin (${isServer ? 'server' : 'client'})...`);

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
