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
import { readFile } from '@i18nflow/shared/server';
import { parseCode, traverse, t } from '@i18nflow/shared';
import { KiwiTypeScriptFileAdapter } from '../file/typescript';
import * as path from 'path';

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
  /** API 路径前缀 */
  pathPrefix?: string;
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
  const {
    localeDir = 'src/lang',
    locales = ['zh-CN', 'en-US'],
    fileExtension = '.ts',
    pathPrefix, // 可选，如果提供则在中间件内部检查路径
  } = config;

  const fileAdapter = new KiwiTypeScriptFileAdapter();
  const { sockWrite } = context || {};

  return async (req: IncomingMessage, res: ServerResponse, next: () => void): Promise<void> => {
    // 如果提供了 pathPrefix，检查路径是否匹配
    // 如果没有提供，说明外层已经过滤了（如 Rspack/Vite），直接处理
    let apiPath = req.url || '/';

    if (pathPrefix) {
      if (!req.url?.startsWith(pathPrefix)) {
        // 不匹配，交给下一个中间件处理
        return next();
      }
      // 去掉路径前缀，得到实际的 API 路径
      apiPath = req.url.slice(pathPrefix.length) || '/';
    }

    console.log(`🔍 I18N Middleware: ${req.method} ${apiPath}`);

    setCorsHeaders(res);

    if (handleOptions(req, res)) {
      return;
    }

    try {
      // 更新翻译
      if (req.method === 'POST' && apiPath === '/update') {
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
      if (req.method === 'GET' && apiPath.startsWith('/read?key=')) {
        const key = decodeURIComponent(apiPath.split('key=')[1]);

        console.log(`📖 Reading I18N key: ${key}`);

        const values = await readI18nValue(key, locales, localeDir, fileExtension, fileAdapter);

        sendJson(res, 200, { success: true, key, values });
        return;
      }

      // AI 翻译接口
      if (req.method === 'POST' && apiPath === '/translate') {
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
      if (req.method === 'GET' && apiPath === '/health') {
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

    // 未匹配的 API 路由，返回 404
    const fullPath = pathPrefix ? `${pathPrefix}${apiPath}` : apiPath;
    console.warn(`⚠️  未匹配的 I18N API 路由: ${fullPath}`);

    const endpointPrefix = pathPrefix || '';
    sendError(res, 404, 'API endpoint not found', {
      path: fullPath,
      availableEndpoints: [
        `GET ${endpointPrefix}/health`,
        `GET ${endpointPrefix}/read?key=xxx`,
        `POST ${endpointPrefix}/update`,
        `POST ${endpointPrefix}/translate`,
      ],
    });
  };
}

/**
 * 模块导入信息
 */
interface ModuleImport {
  /** 导入的变量名 */
  localName: string;
  /** 导入的源路径 */
  sourcePath: string;
  /** 是否在导出对象中被展开 */
  isSpread: boolean;
}

/**
 * 文件解析结果
 */
interface FileResolveResult {
  /** 实际的文件路径 */
  filePath: string;
  /** 属性路径（可能需要调整） */
  propertyPath: string[];
}

/**
 * 解析 index.ts 的导入和展开，找到 key 实际定义的文件
 */
async function resolveFileForKey(
  indexFilePath: string,
  propertyPath: string[]
): Promise<FileResolveResult> {
  try {
    const content = await readFile(indexFilePath);
    const ast = parseCode(content);

    // 收集导入信息
    const imports: ModuleImport[] = [];

    // 第一步：收集所有 import 语句
    traverse(ast, {
      ImportDeclaration(importPath: any) {
        const node = importPath.node;
        const sourcePath = node.source.value;

        // 只处理 default import
        for (const specifier of node.specifiers) {
          if (t.isImportDefaultSpecifier(specifier)) {
            imports.push({
              localName: specifier.local.name,
              sourcePath,
              isSpread: false, // 稍后在 ExportDefaultDeclaration 中标记
            });
          }
        }
      },
    });

    // 第二步：查找 export default 中被展开的模块
    const spreadModules = new Set<string>();

    traverse(ast, {
      ExportDefaultDeclaration(exportPath: any) {
        const declaration = exportPath.node.declaration;
        if (t.isObjectExpression(declaration)) {
          // 查找所有的 SpreadElement
          for (const prop of declaration.properties) {
            if (t.isSpreadElement(prop)) {
              if (t.isIdentifier(prop.argument)) {
                spreadModules.add(prop.argument.name);
              }
            }
          }
        }
      },
    });

    // 标记被展开的导入
    for (const imp of imports) {
      if (spreadModules.has(imp.localName)) {
        imp.isSpread = true;
      }
    }

    // 第三步：检查 key 的第一部分是否在 index.ts 的导出中
    const firstKey = propertyPath[0];
    let isDirectExport = false;
    let importedModule: string | null = null;

    traverse(ast, {
      ExportDefaultDeclaration(exportPath: any) {
        const declaration = exportPath.node.declaration;
        if (t.isObjectExpression(declaration)) {
          for (const prop of declaration.properties) {
            if (t.isObjectProperty(prop)) {
              const key = t.isIdentifier(prop.key)
                ? prop.key.name
                : t.isStringLiteral(prop.key)
                  ? prop.key.value
                  : null;

              if (key === firstKey) {
                // 检查值是否是 Identifier（即：examples 而不是 { ... }）
                if (t.isIdentifier(prop.value)) {
                  // 这是一个导入的模块引用，例如 examples: examples
                  importedModule = prop.value.name;
                } else {
                  // 这是直接定义的对象，例如 app: { title: '...' }
                  isDirectExport = true;
                }
                break;
              }
            }
          }
        }
      },
    });

    // 如果找到了导入的模块引用（如 examples）
    if (importedModule) {
      const moduleImport = imports.find(imp => imp.localName === importedModule);
      if (moduleImport) {
        const dir = path.dirname(indexFilePath);
        const modulePath = path.resolve(dir, moduleImport.sourcePath);
        const moduleFilePath = modulePath.endsWith('.ts') ? modulePath : `${modulePath}.ts`;

        try {
          await readFile(moduleFilePath); // 验证文件存在

          // 移除第一个 key（模块名），剩余的是模块内的路径
          const modulePropertyPath = propertyPath.slice(1);

          console.log(`🔗 Found module reference: ${firstKey} -> ${moduleImport.sourcePath}`);

          return {
            filePath: moduleFilePath,
            propertyPath: modulePropertyPath,
          };
        } catch {
          console.warn(`⚠️  Module file not found: ${moduleFilePath}, falling back to index.ts`);
        }
      }
    }

    // 如果是直接导出，使用 index.ts
    if (isDirectExport) {
      return {
        filePath: indexFilePath,
        propertyPath,
      };
    }

    // 第四步：在被展开的模块中查找
    for (const imp of imports) {
      if (!imp.isSpread) continue;

      // 解析模块文件路径
      const dir = path.dirname(indexFilePath);
      const modulePath = path.resolve(dir, imp.sourcePath);

      // 尝试 .ts 扩展名
      const moduleFilePath = modulePath.endsWith('.ts') ? modulePath : `${modulePath}.ts`;

      // 检查这个模块文件中是否有该 key
      try {
        const moduleContent = await readFile(moduleFilePath);
        const moduleAst = parseCode(moduleContent);

        let hasKey = false;
        traverse(moduleAst, {
          ExportDefaultDeclaration(exportPath: any) {
            const declaration = exportPath.node.declaration;
            if (t.isObjectExpression(declaration)) {
              for (const prop of declaration.properties) {
                if (t.isObjectProperty(prop)) {
                  const key = t.isIdentifier(prop.key)
                    ? prop.key.name
                    : t.isStringLiteral(prop.key)
                      ? prop.key.value
                      : null;

                  if (key === firstKey) {
                    hasKey = true;
                    break;
                  }
                }
              }
            }
          },
        });

        if (hasKey) {
          return {
            filePath: moduleFilePath,
            propertyPath,
          };
        }
      } catch {
        // 模块文件不存在或无法读取，继续尝试下一个
        console.warn(`⚠️  无法读取模块文件: ${moduleFilePath}`);
      }
    }

    // 默认返回 index.ts
    return {
      filePath: indexFilePath,
      propertyPath,
    };
  } catch (error) {
    console.error('❌ 解析文件错误:', error);
    // 出错时返回原始路径
    return {
      filePath: indexFilePath,
      propertyPath,
    };
  }
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
    // index.ts 文件路径
    const indexFilePath = `${process.cwd()}/${localeDir}/${locale}/index${fileExtension}`;

    try {
      // 解析实际应该更新的文件
      const resolved = await resolveFileForKey(indexFilePath, propertyPath);

      console.log(
        `📍 [${locale}] Key '${key}' resolved to: ${path.relative(process.cwd(), resolved.filePath)}`
      );

      const success = await fileAdapter.update(
        resolved.filePath,
        resolved.propertyPath,
        values[locale] || ''
      );

      results[locale] = { success, filePath: resolved.filePath };
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
    // index.ts 文件路径
    const indexFilePath = `${process.cwd()}/${localeDir}/${locale}/index${fileExtension}`;

    try {
      // 解析实际应该读取的文件
      const resolved = await resolveFileForKey(indexFilePath, propertyPath);

      console.log(
        `📍 [${locale}] Key '${key}' resolved to: ${path.relative(process.cwd(), resolved.filePath)}`
      );

      const value = await fileAdapter.extractValue(resolved.filePath, resolved.propertyPath);
      values[locale] = value || '';
    } catch (error) {
      console.error(`❌ Error reading ${locale}:`, error);
      values[locale] = '';
    }
  }

  return values;
}
