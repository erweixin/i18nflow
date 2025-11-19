/**
 * Kiwi Rsbuild 插件
 * 集成 Babel Transform 和 Dev Server 中间件
 */

import { createKiwiBabelPlugin } from '../transform/babel-plugin';
import { createAutoProxyPlugin } from '../transform/auto-proxy-plugin';
import { createKiwiMiddleware, type KiwiMiddlewareConfig } from '../server/middleware';

/**
 * Rsbuild 插件类型（避免直接依赖 @rsbuild/core）
 */
interface RsbuildPluginAPI {
  modifyRspackConfig: (callback: (config: any, utils: any) => any | Promise<any>) => void;
  modifyRsbuildConfig: (callback: (config: any, utils: any) => any | Promise<any>) => void;
  onDevCompileDone: (callback: (stats: any) => void | Promise<void>) => void;
  context: {
    devServer?: any;
  };
}

interface RsbuildPlugin {
  name: string;
  setup: (api: RsbuildPluginAPI) => void | Promise<void>;
}

export interface KiwiRsbuildPluginOptions extends KiwiMiddlewareConfig {
  /** i18n 对象名称 */
  i18nIdentifier?: string;
  /** 是否自动包装 kiwiIntl（默认：true），设为 false 则需要手动调用 createKiwiProxy */
  autoProxy?: boolean;
  /** 是否自动注入 I18nDebugUI（默认：true），设为 false 则需要手动在应用中添加 */
  autoInjectDebugUI?: boolean;
}

/**
 * 创建 Kiwi Rsbuild 插件
 */
export function createKiwiRsbuildPlugin(options: KiwiRsbuildPluginOptions = {}): RsbuildPlugin {
  const pluginOptions: KiwiRsbuildPluginOptions = {
    i18nIdentifier: 'I18N',
    localeDir: 'src/lang',
    locales: ['zh-CN', 'en-US'],
    fileExtension: '.ts',
    autoProxy: true,
    autoInjectDebugUI: true,
    ...options,
  };

  return {
    name: 'rsbuild-plugin-kiwi-i18n',

    setup(api) {
      console.log('🔧 Setting up Kiwi I18N Debug Plugin for Rsbuild...');

      // 修改 Rspack 配置
      api.modifyRspackConfig((config, { mergeConfig }) => {
        // 准备 Babel 插件列表
        const babelPlugins: any[] = [
          createKiwiBabelPlugin({ i18nIdentifier: pluginOptions.i18nIdentifier || 'I18N' }),
        ];

        // 如果启用了自动包装，添加 auto-proxy 插件
        if (pluginOptions.autoProxy !== false) {
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

        // 自动注入 I18nDebugUI
        let modifiedEntry = config.entry;
        if (pluginOptions.autoInjectDebugUI !== false) {
          const debugUIInjectorPath = '@i18nflow/kiwi/runtime/debug-ui-injector';

          if (typeof config.entry === 'string') {
            modifiedEntry = [debugUIInjectorPath, config.entry];
          } else if (Array.isArray(config.entry)) {
            modifiedEntry = [debugUIInjectorPath, ...config.entry];
          } else if (typeof config.entry === 'object' && config.entry !== null) {
            modifiedEntry = { ...config.entry };
            Object.keys(modifiedEntry).forEach(key => {
              const entryValue = modifiedEntry[key];
              if (typeof entryValue === 'string') {
                modifiedEntry[key] = [debugUIInjectorPath, entryValue];
              } else if (Array.isArray(entryValue)) {
                modifiedEntry[key] = [debugUIInjectorPath, ...entryValue];
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

          console.log('✅ I18nDebugUI will be auto-injected');
        }

        return mergeConfig(config, {
          entry: modifiedEntry,
          module: {
            rules: [babelRule],
          },
        });
      });

      // 添加 Dev Server 中间件（使用 Rsbuild 的 dev.setupMiddlewares）
      api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) => {
        return mergeRsbuildConfig(config, {
          dev: {
            setupMiddlewares: [
              (middlewares: any, context: any) => {
                const middleware = createKiwiMiddleware(
                  {
                    ...pluginOptions,
                    pathPrefix: '/api/i18n', // 明确指定路径前缀
                  },
                  {
                    sockWrite: (type: string) => {
                      // Rsbuild 的 HMR 触发方式
                      // 参考：https://rsbuild.rs/zh/config/dev/setup-middlewares
                      context.sockWrite(type);
                    },
                  }
                );

                // 在中间件列表最前面添加（在内置中间件之前执行）
                middlewares.unshift(middleware);
              },
            ],
          },
        });
      });

      // 编译完成回调
      api.onDevCompileDone(() => {
        console.log('✨ Kiwi I18N Debug Plugin for Rsbuild setup completed');
      });
    },
  };
}

// 导出默认插件工厂函数（兼容不同的导入方式）
export default createKiwiRsbuildPlugin;
