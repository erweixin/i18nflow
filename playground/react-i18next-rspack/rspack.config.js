const path = require('path');
const rspack = require('@rspack/core');
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');
const { ReactI18nextRspackPlugin } = require('@i18nflow/react-i18next/plugin-rspack');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * @type {import('@rspack/core').Configuration}
 */
module.exports = {
  context: __dirname,
  entry: {
    main: './src/index.tsx',
  },
  experiments: {
    css: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash:8].js',
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[contenthash:8].chunk.js',
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: isDev,
                  refresh: isDev,
                },
              },
            },
            env: {
              targets: 'defaults',
            },
          },
        },
      },
      {
        test: /\.css$/,
        type: 'css',
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './public/index.html',
      title: 'React-i18next + Rspack Demo',
      inject: 'body',
    }),
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    isDev && new ReactRefreshPlugin(),
    // 🔥 使用 @i18nflow/react-i18next 插件
    isDev &&
      new ReactI18nextRspackPlugin({
        enabled: true,
        localeDir: 'src/i18n/locales',
        locales: ['zh-CN', 'en-US'],
        defaultNs: 'common',
      }),
  ].filter(Boolean),
  devServer: {
    port: 3040,
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
  optimization: {
    minimize: !isDev,
    moduleIds: isDev ? 'named' : 'deterministic',
    chunkIds: isDev ? 'named' : 'deterministic',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    },
  },
  stats: {
    preset: 'normal',
    colors: true,
  },
};
