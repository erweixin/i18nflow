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
  /** i18n 对象名称 */
  i18nIdentifier?: string;
  /** 是否自动包装 kiwiIntl（默认：true），设为 false 则需要手动调用 createKiwiProxy */
  autoProxy?: boolean;
  /** 是否自动注入 I18nDebugProvider（默认：true），设为 false 则需要手动在应用中添加 */
  autoInjectDebugUI?: boolean;
}

/**
 * Kiwi Rspack 插件
 */
export class KiwiRspackPlugin implements RspackPluginInstance {
  private options: KiwiRspackPluginOptions;

  constructor(options: KiwiRspackPluginOptions = {}) {
    this.options = {
      i18nIdentifier: 'I18N',
      localeDir: 'src/lang',
      locales: ['zh-CN', 'en-US'],
      fileExtension: '.ts',
      autoProxy: true,
      autoInjectDebugUI: true,
      ...options,
    };
  }

  apply(compiler: Compiler): void {
    console.log('🔧 Setting up Kiwi I18N Debug Plugin...');

    // 自动注入 I18nDebugProvider
    if (this.options.autoInjectDebugUI) {
      this.injectDebugUI(compiler);
    }

    // 修改 Rspack 配置
    compiler.options.module = compiler.options.module || {};
    compiler.options.module.rules = compiler.options.module.rules || [];

    // 准备 Babel 插件列表
    const babelPlugins: any[] = [
      createKiwiBabelPlugin({ i18nIdentifier: this.options.i18nIdentifier }),
    ];

    // 如果启用了自动包装，添加 auto-proxy 插件
    if (this.options.autoProxy) {
      babelPlugins.push(createAutoProxyPlugin());
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

  /**
   * 自动注入 I18nDebugProvider
   */
  private injectDebugUI(compiler: Compiler): void {
    // 使用包名导入，确保在编译后也能正确解析
    // 这个模块会在编译时被打包到 @i18nflow/kiwi 中
    const debugUIInjectorPath = '@i18nflow/kiwi/runtime/debug-ui-injector';

    // 修改 entry 配置，在主入口之前添加调试 UI 注入模块
    const originalEntry = compiler.options.entry;

    if (typeof originalEntry === 'string') {
      compiler.options.entry = [debugUIInjectorPath, originalEntry];
    } else if (Array.isArray(originalEntry)) {
      compiler.options.entry = [debugUIInjectorPath, ...originalEntry];
    } else if (typeof originalEntry === 'object' && originalEntry !== null) {
      // 对象形式的 entry，修改每个入口点
      Object.keys(originalEntry).forEach(key => {
        const entryValue = originalEntry[key];
        if (typeof entryValue === 'string') {
          originalEntry[key] = [debugUIInjectorPath, entryValue];
        } else if (Array.isArray(entryValue)) {
          originalEntry[key] = [debugUIInjectorPath, ...entryValue];
        } else if (typeof entryValue === 'object' && entryValue.import) {
          const importValue = entryValue.import;
          if (typeof importValue === 'string') {
            entryValue.import = [debugUIInjectorPath, importValue];
          } else if (Array.isArray(importValue)) {
            entryValue.import = [debugUIInjectorPath, ...importValue];
          }
        }
      });
    }

    console.log('✅ I18nDebugProvider will be auto-injected');
  }
}
