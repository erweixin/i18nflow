/**
 * Kiwi Dev Server 中间件
 * 处理 i18n 更新请求
 */

import type { IncomingMessage, ServerResponse } from 'http';
import type { BatchUpdateResult, TranslationValues } from '@i18nflow/core';
import type { MiddlewareContext } from '@i18nflow/shared/server';
import {
  parseBody,
  setCorsHeaders,
  sendJson,
  sendError,
  handleOptions,
} from '@i18nflow/shared/server';
import { KiwiTypeScriptFileAdapter } from '../file/typescript';

/**
 * AI 翻译配置
 */
interface AIConfig {
  enabled: boolean;
  message?: string;
}

/**
 * Kiwi 中间件配置
 */
export interface KiwiMiddlewareConfig {
  /** 语言目录 */
  localeDir?: string;
  /** 支持的语言列表 */
  locales?: string[];
  /** 文件扩展名 */
  fileExtension?: string;
  /** AI 翻译配置 */
  aiTranslate?: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
  };
}

/**
 * 创建 Kiwi I18N 调试中间件
 */
export function createKiwiMiddleware(
  config: KiwiMiddlewareConfig = {},
  context?: MiddlewareContext
) {
  const { localeDir = 'src/lang', locales = ['zh-CN', 'en-US'], fileExtension = '.ts' } = config;

  const fileAdapter = new KiwiTypeScriptFileAdapter();
  const { sockWrite } = context || {};

  return async (req: IncomingMessage, res: ServerResponse, _next: () => void): Promise<void> => {
    console.log(`🔍 I18N Middleware: ${req.method} ${req.url}`);

    setCorsHeaders(res);

    if (handleOptions(req, res)) {
      return;
    }

    try {
      // 更新翻译
      if (req.method === 'POST' && req.url === '/update') {
        const data = await parseBody(req);
        const { key, values } = data as { key: string; values: TranslationValues };

        console.log(`📝 Updating I18N key: ${key}`);

        const results = await batchUpdateI18n(
          key,
          values,
          locales,
          localeDir,
          fileExtension,
          fileAdapter
        );

        // 触发 HMR
        if (sockWrite) {
          sockWrite('static-changed');
        }

        sendJson(res, 200, { success: true, results });
        return;
      }

      // 读取翻译
      if (req.method === 'GET' && req.url?.startsWith('/read?key=')) {
        const key = decodeURIComponent(req.url.split('key=')[1]);

        console.log(`📖 Reading I18N key: ${key}`);

        const values = await readI18nValue(key, locales, localeDir, fileExtension, fileAdapter);

        sendJson(res, 200, { success: true, key, values });
        return;
      }

      // AI 翻译接口
      if (req.method === 'POST' && req.url === '/translate') {
        const data = await parseBody(req);
        const { text } = data as {
          text: string;
          candidateCount?: number;
        };

        console.log(`🤖 AI 翻译: ${text}`);

        // TODO: 实现 AI 翻译功能
        sendError(res, 501, 'AI translation not implemented yet');
        return;
      }

      // 健康检查
      if (req.method === 'GET' && req.url === '/health') {
        const aiConfig: AIConfig = {
          enabled: false,
          message: 'AI translation not configured',
        };

        sendJson(res, 200, {
          status: 'ok',
          message: 'I18N Debug API is running',
          ai: aiConfig,
        });
        return;
      }
    } catch (error) {
      console.error('❌ I18N middleware error:', error);
      sendError(res, 500, error instanceof Error ? error.message : 'Internal server error', {
        stack: error instanceof Error ? error.stack : undefined,
      });
      return;
    }

    // 未匹配的路由
    console.warn(`⚠️  未匹配的 I18N API 路由: ${req.url}`);
    sendError(res, 404, 'API endpoint not found', {
      path: req.url,
      availableEndpoints: [
        'GET /api/i18n/health',
        'GET /api/i18n/read?key=xxx',
        'POST /api/i18n/update',
        'POST /api/i18n/translate',
      ],
    });
  };
}

/**
 * 批量更新多个语言的翻译
 */
async function batchUpdateI18n(
  key: string,
  values: TranslationValues,
  locales: string[],
  localeDir: string,
  fileExtension: string,
  fileAdapter: KiwiTypeScriptFileAdapter
): Promise<BatchUpdateResult> {
  const parts = key.split('.');

  if (parts.length < 1) {
    throw new Error(`Invalid I18N key: ${key}`);
  }

  // 属性路径就是完整的 key（例如 'app.title' -> ['app', 'title']）
  const propertyPath = parts;

  const results: BatchUpdateResult = {};

  for (const locale of locales) {
    // 统一读取 index.ts 文件
    const filePath = `${process.cwd()}/${localeDir}/${locale}/index${fileExtension}`;

    try {
      const success = await fileAdapter.update(filePath, propertyPath, values[locale] || '');
      results[locale] = { success, filePath };
    } catch (error) {
      results[locale] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  return results;
}

/**
 * 读取指定 key 的翻译内容
 */
async function readI18nValue(
  key: string,
  locales: string[],
  localeDir: string,
  fileExtension: string,
  fileAdapter: KiwiTypeScriptFileAdapter
): Promise<TranslationValues> {
  const parts = key.split('.');

  if (parts.length < 1) {
    throw new Error(`Invalid I18N key: ${key}`);
  }

  // 属性路径就是完整的 key（例如 'app.title' -> ['app', 'title']）
  const propertyPath = parts;

  const values: TranslationValues = {};

  for (const locale of locales) {
    // 统一读取 index.ts 文件
    const filePath = `${process.cwd()}/${localeDir}/${locale}/index${fileExtension}`;

    try {
      const value = await fileAdapter.extractValue(filePath, propertyPath);
      values[locale] = value || '';
    } catch (error) {
      console.error(`Error reading ${locale}:`, error);
      values[locale] = '';
    }
  }

  return values;
}
