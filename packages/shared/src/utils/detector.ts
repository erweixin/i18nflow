/**
 * 检测规则引擎
 * 用于检测项目使用的 i18n 方案
 */

import type { DetectRule } from '@i18nflow/core';
import { parseCode, traverse } from './ast';
import { fileExistsSync, readFileSync } from './file-utils';
import * as path from 'path';

/**
 * 检测代码是否匹配规则
 */
export function detectInCode(code: string, rules: DetectRule[]): boolean {
  try {
    const ast = parseCode(code);
    let matched = false;

    traverse(ast, {
      // 检测调用表达式
      CallExpression(path: any) {
        for (const rule of rules) {
          if (rule.type === 'call') {
            const callee = path.node.callee;

            // 检查函数名
            if (
              (callee.type === 'Identifier' && callee.name === rule.name) ||
              (callee.type === 'MemberExpression' &&
                callee.property.type === 'Identifier' &&
                callee.property.name === rule.name)
            ) {
              matched = true;
              path.stop();
            }
          }
        }
      },

      // 检测 import 语句
      ImportDeclaration(path: any) {
        for (const rule of rules) {
          if (rule.type === 'import' && rule.module) {
            if (path.node.source.value === rule.module) {
              // 检查是否导入了指定的名称
              const specifiers = path.node.specifiers;
              for (const specifier of specifiers) {
                if (
                  specifier.type === 'ImportDefaultSpecifier' ||
                  (specifier.type === 'ImportSpecifier' &&
                    specifier.imported.type === 'Identifier' &&
                    specifier.imported.name === rule.name)
                ) {
                  matched = true;
                  path.stop();
                }
              }
            }
          }
        }
      },

      // 检测标识符
      Identifier(path: any) {
        for (const rule of rules) {
          if (rule.type === 'identifier' && path.node.name === rule.name) {
            matched = true;
            path.stop();
          }
        }
      },
    });

    return matched;
  } catch (error) {
    console.error('Error detecting code:', error);
    return false;
  }
}

/**
 * 在项目中检测 i18n 方案
 * @param projectRoot 项目根目录
 * @param rules 检测规则
 * @param searchPaths 要搜索的路径（相对于项目根目录）
 */
export function detectInProject(
  projectRoot: string,
  rules: DetectRule[],
  searchPaths: string[] = ['src']
): boolean {
  const fs = require('fs');

  // 递归搜索文件
  function searchDirectory(dir: string): boolean {
    const fullPath = path.join(projectRoot, dir);

    if (!fileExistsSync(fullPath)) {
      return false;
    }

    const entries = fs.readdirSync(fullPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      const fullEntryPath = path.join(projectRoot, entryPath);

      if (entry.isDirectory()) {
        // 跳过 node_modules 等目录
        if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
          continue;
        }
        if (searchDirectory(entryPath)) {
          return true;
        }
      } else if (entry.isFile()) {
        // 只检查 JS/TS 文件
        if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
          try {
            const code = readFileSync(fullEntryPath);
            if (detectInCode(code, rules)) {
              console.log(`✅ Detected i18n usage in: ${entryPath}`);
              return true;
            }
          } catch {
            // 忽略读取或解析错误
          }
        }
      }
    }

    return false;
  }

  for (const searchPath of searchPaths) {
    if (searchDirectory(searchPath)) {
      return true;
    }
  }

  return false;
}
