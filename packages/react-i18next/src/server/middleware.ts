/**
 * React-i18next Dev Server 中间件
 * 处理 i18n 更新请求
 */

import type { IncomingMessage, ServerResponse } from 'http';
import type { TranslationValues } from '@i18nflow/core';
import type { MiddlewareContext } from '@i18nflow/shared/server';
import {
  parseBody,
  setCorsHeaders,
  sendJson,
  sendError,
  handleOptions,
} from '@i18nflow/shared/server';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * AI 翻译配置
 */
interface AIConfig {
  enabled: boolean;
  message?: string;
}

/**
 * React-i18next 中间件配置
 */
export interface ReactI18nextMiddlewareConfig {
  /** 语言目录 */
  localeDir?: string;
  /** 支持的语言列表 */
  locales?: string[];
  /** 默认 namespace */
  defaultNs?: string;
  /** AI 翻译配置 */
  aiTranslate?: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
  };
}

/**
 * 解析翻译 key，提取 namespace 和实际 key
 * @param fullKey 完整的 key，格式：namespace:key 或 key
 * @param defaultNs 默认 namespace
 */
function parseTranslationKey(
  fullKey: string,
  defaultNs: string = 'common'
): { ns: string; key: string } {
  if (fullKey.includes(':')) {
    const [ns, ...keyParts] = fullKey.split(':');
    return { ns, key: keyParts.join(':') };
  }
  return { ns: defaultNs, key: fullKey };
}

/**
 * 从嵌套对象中获取值
 */
function getNestedValue(obj: any, keyPath: string): any {
  const keys = keyPath.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * 在嵌套对象中设置值
 */
function setNestedValue(obj: any, keyPath: string, value: any): void {
  const keys = keyPath.split('.');
  const lastKey = keys.pop() ?? '';
  let current = obj;

  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

/**
 * 读取翻译文件
 */
async function readTranslationFile(filePath: string): Promise<Record<string, any>> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // 如果文件不存在，返回空对象
    if ((error as any).code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

/**
 * 写入翻译文件
 */
async function writeTranslationFile(filePath: string, data: Record<string, any>): Promise<void> {
  // 确保目录存在
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // 写入文件，保持格式化
  const content = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 读取指定 key 的所有语言翻译
 */
async function readI18nValue(
  fullKey: string,
  locales: string[],
  localeDir: string,
  defaultNs: string
): Promise<TranslationValues> {
  const { ns, key } = parseTranslationKey(fullKey, defaultNs);
  const values: TranslationValues = {};

  for (const locale of locales) {
    const filePath = path.join(process.cwd(), localeDir, locale, `${ns}.json`);
    try {
      const data = await readTranslationFile(filePath);
      const value = getNestedValue(data, key);
      if (value !== undefined) {
        values[locale] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    } catch (error) {
      console.error(`❌ Error reading translation file ${filePath}:`, error);
    }
  }

  return values;
}

/**
 * 批量更新翻译
 */
async function batchUpdateI18n(
  fullKey: string,
  values: TranslationValues,
  locales: string[],
  localeDir: string,
  defaultNs: string
): Promise<Array<{ locale: string; success: boolean; error?: string }>> {
  const { ns, key } = parseTranslationKey(fullKey, defaultNs);
  const results: Array<{ locale: string; success: boolean; error?: string }> = [];

  for (const locale of locales) {
    try {
      const filePath = path.join(process.cwd(), localeDir, locale, `${ns}.json`);

      // 读取现有数据
      const data = await readTranslationFile(filePath);

      // 更新值
      const newValue = values[locale];
      if (newValue !== undefined) {
        setNestedValue(data, key, newValue);

        // 写回文件
        await writeTranslationFile(filePath, data);

        results.push({ locale, success: true });
        console.log(`✅ Updated ${locale}:${ns}:${key}`);
      } else {
        results.push({ locale, success: true });
        console.log(`⏭️  Skipped ${locale} (no value provided)`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${locale}:`, error);
      results.push({
        locale,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * 创建 React-i18next I18N 调试中间件
 */
export function createReactI18nextMiddleware(
  config: ReactI18nextMiddlewareConfig = {},
  context?: MiddlewareContext
) {
  const {
    localeDir = 'src/i18n/locales',
    locales = ['zh-CN', 'en-US'],
    defaultNs = 'common',
  } = config;

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

        const results = await batchUpdateI18n(key, values, locales, localeDir, defaultNs);

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

        const values = await readI18nValue(key, locales, localeDir, defaultNs);

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
        stack:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.stack
            : undefined,
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
