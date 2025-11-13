/**
 * Kiwi Rspack 插件
 * 集成 Babel Transform 和 Dev Server 中间件
 */

import { createKiwiBabelPlugin } from '../transform/babel-plugin';
import { createAutoProxyPlugin } from '../transform/auto-proxy-plugin';
import { createKiwiMiddleware, type KiwiMiddlewareConfig } from '../server/middleware';

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

export interface KiwiRspackPluginOptions extends KiwiMiddlewareConfig {
  /** 是否启用（默认仅在开发环境启用） */
  enabled?: boolean;
  /** i18n 对象名称 */
  i18nIdentifier?: string;
  /** 是否自动包装 kiwiIntl（默认：true），设为 false 则需要手动调用 createKiwiProxy */
  autoProxy?: boolean;
}

/**
 * Kiwi Rspack 插件
 */
export class KiwiRspackPlugin implements RspackPluginInstance {
  private options: KiwiRspackPluginOptions;

  constructor(options: KiwiRspackPluginOptions = {}) {
    this.options = {
      enabled: true,
      i18nIdentifier: 'I18N',
      localeDir: 'src/lang',
      locales: ['zh-CN', 'en-US'],
      fileExtension: '.ts',
      autoProxy: true,
      ...options,
    };
  }

  apply(compiler: Compiler): void {
    if (!this.options.enabled) {
      console.log('⚪ Kiwi I18N Debug Plugin is disabled');
      return;
    }

    console.log('🔧 Setting up Kiwi I18N Debug Plugin...');

    // 修改 Rspack 配置
    compiler.options.module = compiler.options.module || {};
    compiler.options.module.rules = compiler.options.module.rules || [];

    // 准备 Babel 插件列表
    const babelPlugins: any[] = [
      createKiwiBabelPlugin({ i18nIdentifier: this.options.i18nIdentifier }),
    ];

    // 如果启用了自动包装，添加 auto-proxy 插件
    if (this.options.autoProxy) {
      babelPlugins.push(createAutoProxyPlugin({ enabled: true }));
    }

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
            plugins: babelPlugins,
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
    console.log('✅ Babel loader for Kiwi I18N debug added');

    // 添加 Dev Server 中间件
    compiler.hooks.done.tap('KiwiRspackPlugin', () => {
      console.log('✨ Kiwi I18N Debug Plugin setup completed');
    });

    // 注册 Dev Server 中间件
    if (compiler.options.devServer) {
      const originalSetupMiddlewares = compiler.options.devServer.setupMiddlewares;

      compiler.options.devServer.setupMiddlewares = (middlewares: any, devServer: any) => {
        const middleware = createKiwiMiddleware(this.options, {
          sockWrite: (type: string) => {
            if (devServer.sendMessage) {
              devServer.sendMessage(devServer.webSocketServer?.clients || [], type);
            }
          },
        });

        middlewares.unshift({
          name: 'kiwi-i18n-debug',
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
