/**
 * Kiwi Vite 插件
 * 集成 Babel Transform 和 Dev Server 中间件
 */

import { transformSync } from '@babel/core';
import { createKiwiBabelPlugin } from '../transform/babel-plugin';
import { createAutoProxyPlugin } from '../transform/auto-proxy-plugin';
import { createKiwiMiddleware, type KiwiMiddlewareConfig } from '../server/middleware';

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

export interface KiwiVitePluginOptions extends KiwiMiddlewareConfig {
  /** 是否启用（默认仅在开发环境启用） */
  enabled?: boolean;
  /** i18n 对象名称 */
  i18nIdentifier?: string;
  /** 是否自动包装 kiwiIntl（默认：true），设为 false 则需要手动调用 createKiwiProxy */
  autoProxy?: boolean;
}

/**
 * Kiwi Vite 插件
 */
export function KiwiVitePlugin(options: KiwiVitePluginOptions = {}): Plugin {
  const {
    enabled = true,
    i18nIdentifier = 'I18N',
    localeDir = 'src/lang',
    locales = ['zh-CN', 'en-US'],
    fileExtension = '.ts',
    autoProxy = true,
  } = options;

  let isDev = false;

  return {
    name: 'vite-plugin-kiwi-i18n',

    // 配置模式
    config(_config, { command }) {
      isDev = command === 'serve';
    },

    // 配置开发服务器
    configureServer(server: ViteDevServer) {
      if (!enabled || !isDev) {
        return;
      }

      console.log('🔧 Setting up Kiwi I18N Debug Plugin for Vite...');

      // 创建中间件
      const middleware = createKiwiMiddleware(
        {
          localeDir,
          locales,
          fileExtension,
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

      console.log('✅ Kiwi I18N Debug Plugin setup completed');
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
        // 准备 Babel 插件列表
        const babelPlugins: any[] = [createKiwiBabelPlugin({ i18nIdentifier })];

        // 如果启用了自动包装，添加 auto-proxy 插件
        if (autoProxy) {
          babelPlugins.push(createAutoProxyPlugin({ enabled: true }));
        }

        // 使用 Babel 转换代码
        const result = transformSync(code, {
          filename: id,
          babelrc: false,
          configFile: false,
          compact: false,
          plugins: babelPlugins,
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
