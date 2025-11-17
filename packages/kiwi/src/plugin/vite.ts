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

interface HtmlTagDescriptor {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  children?: string;
  injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
}

interface Plugin {
  name: string;
  config?: (config: any, env: { command: string; mode: string }) => void;
  configureServer?: (server: ViteDevServer) => void;
  transform?: (code: string, id: string) => { code: string; map: any } | null;
  transformIndexHtml?: (html: string) => HtmlTagDescriptor[] | void;
}

export interface KiwiVitePluginOptions extends KiwiMiddlewareConfig {
  /** i18n 对象名称 */
  i18nIdentifier?: string;
  /** 是否自动包装 kiwiIntl（默认：true），设为 false 则需要手动调用 createKiwiProxy */
  autoProxy?: boolean;
  /** 是否自动注入 I18nDebugUI（默认：true），设为 false 则需要手动在应用中添加 */
  autoInjectDebugUI?: boolean;
}

/**
 * Kiwi Vite 插件
 */
export function KiwiVitePlugin(options: KiwiVitePluginOptions = {}): Plugin {
  const {
    i18nIdentifier = 'I18N',
    localeDir = 'src/lang',
    locales = ['zh-CN', 'en-US'],
    fileExtension = '.ts',
    autoProxy = true,
    autoInjectDebugUI = true,
  } = options;

  return {
    name: 'vite-plugin-kiwi-i18n',

    // 配置模式
    config(config) {
      // 确保 @i18nflow/ui-vanilla 被 Vite 正确处理
      if (autoInjectDebugUI) {
        config.optimizeDeps = config.optimizeDeps || {};
        config.optimizeDeps.include = config.optimizeDeps.include || [];
        if (!config.optimizeDeps.include.includes('@i18nflow/ui-vanilla')) {
          config.optimizeDeps.include.push('@i18nflow/ui-vanilla');
        }
      }
    },

    // 配置开发服务器
    configureServer(server: ViteDevServer) {
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
      // 只处理 tsx, jsx, ts, js 文件
      if (!/\.(tsx|jsx|ts|js)$/.test(id)) {
        return null;
      }

      // 跳过 node_modules
      if (id.includes('node_modules')) {
        return null;
      }

      // 检查是否是应用入口文件（通常是 src/index 或 src/main）
      const isEntryFile = /[/\\]src[/\\](index|main)\.(tsx?|jsx?)$/.test(id);

      // 如果启用了自动注入调试 UI，在入口文件顶部注入初始化代码
      if (isEntryFile && autoInjectDebugUI) {
        const debugUICode = `
// Auto-injected by @i18nflow/kiwi Vite plugin
import { I18nDebugUI } from '@i18nflow/ui-vanilla';

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        new I18nDebugUI({
          enabled: true,
          apiBase: '/api/i18n',
        });
        console.log('✨ I18nDebugUI auto-injected by Vite plugin');
      } catch (error) {
        console.error('❌ Failed to inject I18nDebugUI:', error);
      }
    });
  } else {
    try {
      new I18nDebugUI({
        enabled: true,
        apiBase: '/api/i18n',
      });
      console.log('✨ I18nDebugUI auto-injected by Vite plugin');
    } catch (error) {
      console.error('❌ Failed to inject I18nDebugUI:', error);
    }
  }
}

`;
        code = debugUICode + code;
      }

      try {
        // 准备 Babel 插件列表
        const babelPlugins: any[] = [createKiwiBabelPlugin({ i18nIdentifier })];

        // 如果启用了自动包装，添加 auto-proxy 插件
        if (autoProxy) {
          babelPlugins.push(createAutoProxyPlugin());
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
