/**
 * React-i18next Next.js 插件
 * 集成 Babel Transform 和 Dev Server 中间件
 */

import { createReactI18nextBabelPlugin } from '../transform/babel-plugin';
import {
  createReactI18nextMiddleware,
  type ReactI18nextMiddlewareConfig,
} from '../server/middleware';

/**
 * Webpack 类型（避免直接依赖 webpack）
 */
interface Compiler {
  options: any;
  hooks: any;
}

interface WebpackPluginInstance {
  apply(compiler: Compiler): void;
}

export interface ReactI18nextNextPluginOptions extends ReactI18nextMiddlewareConfig {
  /** 是否启用（默认仅在开发环境启用） */
  enabled?: boolean;
  /** t 函数名称 */
  tFunctionName?: string;
  /** Trans 组件名称 */
  transComponentName?: string;
  /** useTranslation hook 名称 */
  hookName?: string;
}

/**
 * React-i18next Next.js 插件
 */
export class ReactI18nextNextPlugin implements WebpackPluginInstance {
  private options: ReactI18nextNextPluginOptions;

  constructor(options: ReactI18nextNextPluginOptions = {}) {
    this.options = {
      enabled: true,
      tFunctionName: 't',
      hookName: 'useTranslation',
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

    // 准备 Babel 插件
    const babelPlugin = createReactI18nextBabelPlugin({
      tFunctionName: this.options.tFunctionName,
      hookName: this.options.hookName,
    });

    // 修改 Webpack 配置，注入 Babel 插件到现有的 babel-loader
    compiler.options.module = compiler.options.module || {};
    compiler.options.module.rules = compiler.options.module.rules || [];

    // 查找并修改现有的 babel-loader 规则
    let babelRuleFound = false;

    for (const rule of compiler.options.module.rules) {
      if (!rule || typeof rule === 'string') continue;

      // 检查是否是 babel-loader 规则
      const isBabelRule = this.checkAndModifyBabelRule(rule, babelPlugin);
      if (isBabelRule) {
        babelRuleFound = true;
      }
    }

    if (babelRuleFound) {
      console.log('✅ Babel plugin injected into existing babel-loader');
    } else {
      // 如果没找到现有的 babel-loader，添加一个新的
      const babelRule = {
        test: /\.(tsx|jsx|ts|js)$/,
        exclude: /node_modules/,
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
      console.log('✅ New Babel loader with plugin added');
    }

    this.setupDevServer(compiler);
  }

  /**
   * 检查并修改 Babel 规则
   */
  private checkAndModifyBabelRule(rule: any, babelPlugin: any): boolean {
    if (!rule) return false;

    // 检查 use 数组
    if (Array.isArray(rule.use)) {
      for (const useItem of rule.use) {
        if (this.modifyBabelLoader(useItem, babelPlugin)) {
          return true;
        }
      }
    }

    // 检查单个 use 对象
    if (rule.use && typeof rule.use === 'object') {
      if (this.modifyBabelLoader(rule.use, babelPlugin)) {
        return true;
      }
    }

    // 检查 loader 属性
    if (typeof rule.loader === 'string' && rule.loader.includes('babel-loader')) {
      rule.options = rule.options || {};
      rule.options.plugins = rule.options.plugins || [];
      rule.options.plugins.push(babelPlugin);
      return true;
    }

    // 递归检查 oneOf 规则
    if (Array.isArray(rule.oneOf)) {
      for (const subRule of rule.oneOf) {
        if (this.checkAndModifyBabelRule(subRule, babelPlugin)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 修改 Babel loader 配置
   */
  private modifyBabelLoader(useItem: any, babelPlugin: any): boolean {
    if (!useItem) return false;

    // 字符串形式的 loader
    if (typeof useItem === 'string' && useItem.includes('babel-loader')) {
      // 无法直接修改字符串形式，需要外层处理
      return false;
    }

    // 对象形式的 loader
    if (typeof useItem === 'object') {
      if (
        useItem.loader &&
        typeof useItem.loader === 'string' &&
        useItem.loader.includes('babel-loader')
      ) {
        useItem.options = useItem.options || {};
        useItem.options.plugins = useItem.options.plugins || [];
        useItem.options.plugins.push(babelPlugin);
        return true;
      }
    }

    return false;
  }

  private setupDevServer(compiler: Compiler): void {
    // 添加 Dev Server 完成钩子
    compiler.hooks.done.tap('ReactI18nextNextPlugin', () => {
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
