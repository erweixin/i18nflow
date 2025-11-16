/**
 * React-i18next Rspack 插件
 * 集成 Babel Transform 和 Dev Server 中间件
 */

import { createReactI18nextBabelPlugin } from '../transform/babel-plugin';
import {
  createReactI18nextMiddleware,
  type ReactI18nextMiddlewareConfig,
} from '../server/middleware';

/**
 * Rspack 类型（避免直接依赖 @rspack/core）
 */
interface Compiler {
  options: any;
  hooks: any;
}

interface RspackPluginInstance {
  apply(compiler: Compiler): void;
}

export interface ReactI18nextRspackPluginOptions extends ReactI18nextMiddlewareConfig {
  /** 是否启用（默认仅在开发环境启用） */
  enabled?: boolean;
  /** t 函数名称 */
  tFunctionName?: string;
  /** useTranslation hook 名称 */
  hookName?: string;
  /** 是否使用自定义签名：useTranslation(lng, ns, options) 而不是标准的 useTranslation(ns, options) */
  customSignature?: boolean;
}

/**
 * React-i18next Rspack 插件
 */
export class ReactI18nextRspackPlugin implements RspackPluginInstance {
  private options: ReactI18nextRspackPluginOptions;

  constructor(options: ReactI18nextRspackPluginOptions = {}) {
    this.options = {
      enabled: true,
      tFunctionName: 't',
      hookName: 'useTranslation',
      customSignature: false,
      localeDir: 'src/i18n/locales',
      locales: ['zh-CN', 'en-US'],
      defaultNs: 'common',
      ...options,
    };
  }

  apply(compiler: Compiler): void {
    if (!this.options.enabled) {
      console.log('⚪ React-i18next I18N Debug Plugin is disabled');
      return;
    }

    console.log('🔧 Setting up React-i18next I18N Debug Plugin...');

    // 修改 Rspack 配置
    compiler.options.module = compiler.options.module || {};
    compiler.options.module.rules = compiler.options.module.rules || [];

    // 准备 Babel 插件
    const babelPlugin = createReactI18nextBabelPlugin({
      tFunctionName: this.options.tFunctionName,
      hookName: this.options.hookName,
      customSignature: this.options.customSignature,
    });

    // 添加 Babel loader 规则
    const babelRule = {
      test: /\.(tsx|jsx|ts|js)$/,
      exclude: /node_modules/,
      enforce: 'pre' as const,
      use: [
        {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            compact: false,
            plugins: [babelPlugin],
            presets: [],
            sourceType: 'unambiguous' as const,
            parserOpts: {
              plugins: ['jsx', 'typescript'],
            },
          },
        },
      ],
    };

    compiler.options.module.rules.unshift(babelRule);
    console.log('✅ Babel loader for React-i18next I18N debug added');

    // 添加 Dev Server 中间件
    compiler.hooks.done.tap('ReactI18nextRspackPlugin', () => {
      console.log('✨ React-i18next I18N Debug Plugin setup completed');
    });

    // 注册 Dev Server 中间件
    if (compiler.options.devServer) {
      const originalSetupMiddlewares = compiler.options.devServer.setupMiddlewares;

      compiler.options.devServer.setupMiddlewares = (middlewares: any, devServer: any) => {
        const middleware = createReactI18nextMiddleware(
          {
            localeDir: this.options.localeDir,
            locales: this.options.locales,
            defaultNs: this.options.defaultNs,
          },
          {
            sockWrite: (type: string) => {
              if (devServer.sendMessage) {
                devServer.sendMessage(devServer.webSocketServer?.clients || [], type);
              }
            },
          }
        );

        middlewares.unshift({
          name: 'react-i18next-debug',
          path: '/api/i18n',
          middleware: middleware as any,
        });

        if (originalSetupMiddlewares) {
          return originalSetupMiddlewares(middlewares, devServer);
        }

        return middlewares;
      };
    }
  }
}
