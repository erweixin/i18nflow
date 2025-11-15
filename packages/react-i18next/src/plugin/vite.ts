/**
 * React-i18next Vite 插件
 * 集成 Babel Transform 和 Dev Server 中间件
 */

import { transformSync } from '@babel/core';
import { createReactI18nextBabelPlugin } from '../transform/babel-plugin';
import {
  createReactI18nextMiddleware,
  type ReactI18nextMiddlewareConfig,
} from '../server/middleware';

// Vite 类型定义（避免直接依赖 vite）
interface ViteDevServer {
  ws: {
    send: (payload: any) => void;
  };
  middlewares: any;
}

interface Plugin {
  name: string;
  config?: (config: any, env: { command: string; mode: string }) => void;
  configureServer?: (server: ViteDevServer) => void;
  transform?: (code: string, id: string) => { code: string; map: any } | null;
}

export interface ReactI18nextVitePluginOptions extends ReactI18nextMiddlewareConfig {
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
 * React-i18next Vite 插件
 */
export function ReactI18nextVitePlugin(options: ReactI18nextVitePluginOptions = {}): Plugin {
  const {
    enabled = true,
    tFunctionName = 't',
    hookName = 'useTranslation',
    localeDir = 'src/i18n/locales',
    locales = ['zh-CN', 'en-US'],
    defaultNs = 'common',
  } = options;

  let isDev = false;

  return {
    name: 'vite-plugin-react-i18next',

    // 配置模式
    config(_config, { command }) {
      isDev = command === 'serve';
    },

    // 配置开发服务器
    configureServer(server: ViteDevServer) {
      if (!enabled || !isDev) {
        return;
      }

      console.log('🔧 Setting up React-i18next I18N Debug Plugin for Vite...');

      // 创建中间件
      const middleware = createReactI18nextMiddleware(
        {
          localeDir,
          locales,
          defaultNs,
        },
        {
          sockWrite: (_type: string) => {
            // 触发 Vite HMR
            server.ws.send({
              type: 'full-reload',
              path: '*',
            });
          },
        }
      );

      // 注册中间件
      server.middlewares.use('/api/i18n', middleware as any);

      console.log('✅ React-i18next I18N Debug Plugin setup completed');
    },

    // 转换代码
    transform(code: string, id: string) {
      // 只在开发环境和启用时处理
      if (!enabled || !isDev) {
        return null;
      }

      // 只处理 tsx, jsx, ts, js 文件
      if (!/\.(tsx|jsx|ts|js)$/.test(id)) {
        return null;
      }

      // 跳过 node_modules
      if (id.includes('node_modules')) {
        return null;
      }

      try {
        // 使用 Babel 转换代码
        const result = transformSync(code, {
          filename: id,
          babelrc: false,
          configFile: false,
          compact: false,
          plugins: [
            createReactI18nextBabelPlugin({
              tFunctionName,
              hookName,
            }),
          ],
          presets: [],
          sourceType: 'module',
          parserOpts: {
            plugins: ['jsx', 'typescript'],
          },
          sourceMaps: true,
        });

        if (result && result.code) {
          return {
            code: result.code,
            map: result.map,
          };
        }
      } catch (error) {
        console.error(`❌ Error transforming ${id}:`, error);
        // 如果转换失败，返回原始代码
        return null;
      }

      return null;
    },
  };
}
