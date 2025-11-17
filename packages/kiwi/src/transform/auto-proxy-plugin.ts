/**
 * Kiwi Auto Proxy Babel 插件
 * 自动包装 kiwi-intl 实例，无需手动调用 createKiwiProxy
 *
 * 转换示例：
 *
 * 输入：
 * ```typescript
 * import KiwiIntl from 'kiwi-intl';
 * const kiwiIntl = KiwiIntl.init('zh-CN', {...});
 * export default kiwiIntl;
 * ```
 *
 * 输出：
 * ```typescript
 * import KiwiIntl from 'kiwi-intl';
 * import { createKiwiProxy as __i18nflow_createKiwiProxy } from '@i18nflow/kiwi';
 * const kiwiIntl = KiwiIntl.init('zh-CN', {...});
 * export default __i18nflow_createKiwiProxy(kiwiIntl);
 * ```
 */

import type { PluginObj, PluginPass } from '@babel/core';
import * as t from '@babel/types';

interface AutoProxyPluginState extends PluginPass {
  kiwiIntlImported: boolean;
  kiwiIntlVariables: Set<string>;
  proxyImportAdded: boolean;
}

export interface AutoProxyPluginOptions {
  /** kiwi-intl 包名（默认：'kiwi-intl'） */
  kiwiIntlPackage?: string;
  /** @i18nflow/kiwi 包名（默认：'@i18nflow/kiwi'） */
  i18nflowPackage?: string;
}

const PROXY_FUNCTION_NAME = '__i18nflow_createKiwiProxy';

/**
 * 创建自动 Proxy 包装插件
 */
export function createAutoProxyPlugin(
  options: AutoProxyPluginOptions = {}
): PluginObj<AutoProxyPluginState> {
  const { kiwiIntlPackage = 'kiwi-intl', i18nflowPackage = '@i18nflow/kiwi' } = options;

  return {
    name: 'kiwi-auto-proxy',

    visitor: {
      Program: {
        enter(_path, state) {
          state.kiwiIntlImported = false;
          state.kiwiIntlVariables = new Set();
          state.proxyImportAdded = false;
        },
      },

      // 检测 kiwi-intl 的导入
      ImportDeclaration(path, state) {
        const source = path.node.source.value;

        // 检查是否导入了 kiwi-intl
        if (source === kiwiIntlPackage) {
          state.kiwiIntlImported = true;

          // 记录导入的标识符（通常是 KiwiIntl）
          path.node.specifiers.forEach(spec => {
            if (t.isImportDefaultSpecifier(spec) && t.isIdentifier(spec.local)) {
              // 这是 KiwiIntl 的导入
            }
          });
        }

        // 检查是否已经导入了 createKiwiProxy
        if (source === i18nflowPackage) {
          const hasProxyImport = path.node.specifiers.some(spec => {
            if (t.isImportSpecifier(spec)) {
              const importedName = t.isIdentifier(spec.imported)
                ? spec.imported.name
                : (spec.imported as t.StringLiteral).value;
              return importedName === 'createKiwiProxy';
            }
            return false;
          });

          if (hasProxyImport) {
            // 用户已经手动导入了，不需要自动处理
            state.kiwiIntlImported = false;
          }
        }
      },

      // 检测 KiwiIntl.init() 的调用并记录变量名
      VariableDeclarator(path, state) {
        if (!state.kiwiIntlImported) return;

        const { id, init } = path.node;

        // 检查是否是 KiwiIntl.init() 或类似的调用
        if (
          t.isIdentifier(id) &&
          init &&
          (t.isCallExpression(init) || t.isOptionalCallExpression(init))
        ) {
          const callee = init.callee;

          // 检查是否是 KiwiIntl.init() 或 KiwiIntl.init?.()
          if (t.isMemberExpression(callee) || t.isOptionalMemberExpression(callee)) {
            const property = callee.property;
            if (t.isIdentifier(property) && property.name === 'init') {
              // 记录这个变量名（例如 kiwiIntl）
              state.kiwiIntlVariables.add(id.name);
            }
          }
        }
      },

      // 处理导出语句
      ExportDefaultDeclaration(path, state) {
        if (!state.kiwiIntlImported || state.kiwiIntlVariables.size === 0) {
          return;
        }

        const declaration = path.node.declaration;

        // 检查是否导出的是 kiwiIntl 变量
        if (t.isIdentifier(declaration)) {
          const varName = declaration.name;

          if (state.kiwiIntlVariables.has(varName)) {
            // 需要自动包装

            // 1. 添加 createKiwiProxy 的导入（如果还没添加）
            if (!state.proxyImportAdded) {
              addProxyImport(path, i18nflowPackage);
              state.proxyImportAdded = true;
            }

            // 2. 用 createKiwiProxy 包装导出
            const wrappedExport = t.callExpression(t.identifier(PROXY_FUNCTION_NAME), [
              declaration,
            ]);

            path.node.declaration = wrappedExport;
          }
        }

        // 处理直接导出表达式的情况
        // export default KiwiIntl.init(...)
        if (t.isCallExpression(declaration) || t.isOptionalCallExpression(declaration)) {
          const callee = declaration.callee;

          if (t.isMemberExpression(callee) || t.isOptionalMemberExpression(callee)) {
            const property = callee.property;
            if (t.isIdentifier(property) && property.name === 'init') {
              // 需要自动包装

              // 1. 添加 createKiwiProxy 的导入（如果还没添加）
              if (!state.proxyImportAdded) {
                addProxyImport(path, i18nflowPackage);
                state.proxyImportAdded = true;
              }

              // 2. 用 createKiwiProxy 包装导出
              const wrappedExport = t.callExpression(t.identifier(PROXY_FUNCTION_NAME), [
                declaration,
              ]);

              path.node.declaration = wrappedExport;
            }
          }
        }
      },

      // 处理命名导出
      ExportNamedDeclaration(path, state) {
        if (!state.kiwiIntlImported || state.kiwiIntlVariables.size === 0) {
          return;
        }

        // 处理 export { kiwiIntl } 或 export { kiwiIntl as I18N }
        if (path.node.specifiers.length > 0) {
          let needsWrapping = false;
          let exportName: string | null = null;

          path.node.specifiers.forEach(spec => {
            if (t.isExportSpecifier(spec)) {
              const localName = t.isIdentifier(spec.local) ? spec.local.name : '';

              if (state.kiwiIntlVariables.has(localName)) {
                needsWrapping = true;
                exportName = t.isIdentifier(spec.exported)
                  ? spec.exported.name
                  : spec.exported.value;
              }
            }
          });

          if (needsWrapping && exportName) {
            // 添加 createKiwiProxy 的导入
            if (!state.proxyImportAdded) {
              addProxyImport(path, i18nflowPackage);
              state.proxyImportAdded = true;
            }

            // 转换为变量声明 + 导出
            // export { kiwiIntl } → const __wrapped = createKiwiProxy(kiwiIntl); export { __wrapped as kiwiIntl }
            const wrappedVarName = `__i18nflow_wrapped_${exportName}`;

            const varDeclaration = t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier(wrappedVarName),
                t.callExpression(t.identifier(PROXY_FUNCTION_NAME), [t.identifier(exportName)])
              ),
            ]);

            const newExportDeclaration = t.exportNamedDeclaration(null, [
              t.exportSpecifier(t.identifier(wrappedVarName), t.identifier(exportName)),
            ]);

            path.replaceWithMultiple([varDeclaration, newExportDeclaration]);
          }
        }
      },
    },
  };
}

/**
 * 添加 createKiwiProxy 的导入声明
 */
function addProxyImport(path: any, packageName: string): void {
  const program = path.findParent((p: any) => p.isProgram());

  if (program) {
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier(PROXY_FUNCTION_NAME), t.identifier('createKiwiProxy'))],
      t.stringLiteral(packageName)
    );

    // 在第一个非导入语句之前插入
    const body = program.node.body;
    let insertIndex = 0;

    for (let i = 0; i < body.length; i++) {
      if (!t.isImportDeclaration(body[i])) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }

    body.splice(insertIndex, 0, importDeclaration);
  }
}
