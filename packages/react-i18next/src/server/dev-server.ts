#!/usr/bin/env node

/**
 * React-i18next 独立开发服务器
 * 用于为 Next.js 等无法使用 webpack middleware 的框架提供 i18n API 服务
 */

import * as http from 'http';
import { createReactI18nextMiddleware, type ReactI18nextMiddlewareConfig } from './middleware';

interface DevServerOptions extends ReactI18nextMiddlewareConfig {
  port?: number;
  host?: string;
}

/**
 * 启动开发服务器
 */
export function startDevServer(options: DevServerOptions = {}): http.Server {
  const {
    port = 3034,
    host = 'localhost',
    localeDir = 'src/i18n/locales',
    locales = ['zh-CN', 'en-US'],
    defaultNs = 'common',
  } = options;

  // 创建 i18n 中间件
  const i18nMiddleware = createReactI18nextMiddleware({
    localeDir,
    locales,
    defaultNs,
  });

  // 创建 HTTP 服务器
  const server = http.createServer((req, res) => {
    // 处理所有以 /api/i18n 开头的请求
    if (req.url?.startsWith('/api/i18n')) {
      // 去掉 /api/i18n 前缀
      const originalUrl = req.url;
      req.url = req.url.replace(/^\/api\/i18n/, '');

      i18nMiddleware(req, res, () => {
        // 如果中间件没有处理，返回 404
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            success: false,
            error: 'Not found',
            path: originalUrl,
          })
        );
      });
    } else {
      // 非 i18n API 请求
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: 'Not found',
          message: 'This server only handles /api/i18n/* requests',
        })
      );
    }
  });

  // 启动服务器
  server.listen(port, host, () => {
    console.log('');
    console.log('┌────────────────────────────────────────────────────┐');
    console.log('│                                                    │');
    console.log('│   🚀 React-i18next Dev Server Started             │');
    console.log('│                                                    │');
    console.log(`│   URL:      http://${host}:${port}/api/i18n       │`);
    console.log(`│   Locales:  ${locales.join(', ').padEnd(35)}│`);
    console.log(`│   Dir:      ${localeDir.padEnd(35)}│`);
    console.log('│                                                    │');
    console.log('│   Available endpoints:                             │');
    console.log('│   - GET  /api/i18n/health                          │');
    console.log('│   - GET  /api/i18n/read?key=xxx                    │');
    console.log('│   - POST /api/i18n/update                          │');
    console.log('│   - POST /api/i18n/translate                       │');
    console.log('│                                                    │');
    console.log('└────────────────────────────────────────────────────┘');
    console.log('');
  });

  // 错误处理
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Please try a different port.`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  // 优雅关闭
  const shutdown = () => {
    console.log('\n👋 Shutting down React-i18next Dev Server...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

// 如果直接运行此文件，启动服务器
if (require.main === module) {
  // 解析命令行参数
  const args = process.argv.slice(2);
  const options: DevServerOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const value = args[i + 1];

    switch (arg) {
      case '--port':
      case '-p':
        options.port = parseInt(value, 10);
        i++;
        break;
      case '--host':
      case '-h':
        options.host = value;
        i++;
        break;
      case '--locale-dir':
      case '-d':
        options.localeDir = value;
        i++;
        break;
      case '--locales':
      case '-l':
        options.locales = value.split(',');
        i++;
        break;
      case '--default-ns':
      case '-n':
        options.defaultNs = value;
        i++;
        break;
      case '--help':
        console.log(`
React-i18next Dev Server

Usage: i18n-dev-server [options]

Options:
  -p, --port <port>           Port number (default: 3034)
  -h, --host <host>           Host address (default: localhost)
  -d, --locale-dir <dir>      Locale directory path (default: src/i18n/locales)
  -l, --locales <locales>     Comma-separated locale list (default: zh-CN,en-US)
  -n, --default-ns <ns>       Default namespace (default: common)
  --help                      Show this help message

Examples:
  i18n-dev-server
  i18n-dev-server -p 3035 -d public/locales
  i18n-dev-server --locales zh-CN,en-US,ja-JP
        `);
        process.exit(0);
        break;
    }
  }

  startDevServer(options);
}
