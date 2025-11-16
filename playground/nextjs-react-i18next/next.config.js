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
  // 开发环境下，将 /api/i18n 请求代理到独立的 i18n 开发服务器
  // 只在开发环境启用（生产环境不需要）
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }

    return [
      {
        source: '/api/i18n/:path*',
        destination: 'http://localhost:3034/api/i18n/:path*',
      },
    ];
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
          customSignature: true, // 使用自定义签名 useTranslation(lng, ns, options)
        })
      );

      console.log('✅ Plugin added, rules count:', config.module.rules.length);
    }
    return config;
  },
};

module.exports = nextConfig;
