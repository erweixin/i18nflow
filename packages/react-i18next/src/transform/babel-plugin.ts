/**
 * React-i18next Babel 插件
 *
 * 功能：
 * 1. 自动检测 useTranslation 调用，包装返回的 t 函数
 * 2. 处理 JSX 中的 t() 调用，添加必要的转换
 *
 * 转换示例：
 * ```typescript
 * // 转换前
 * const { t } = useTranslation(lng, 'common', { keyPrefix: 'users' });
 *
 * // 转换后
 * import { wrapTFunction as __i18nflow_wrap } from '@i18nflow/react-i18next';
 * const { t: __i18nflow_t_original } = useTranslation(lng, 'common', { keyPrefix: 'users' });
 * const t = __i18nflow_wrap(__i18nflow_t_original, 'common:users');
 * ```
 */

import type { PluginObj, PluginPass } from '@babel/core';
import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';

/**
 * 插件配置选项
 */
interface BabelPluginOptions {
  /** useTranslation hook 名称（默认：'useTranslation'） */
  hookName?: string;
  /** t 函数名称（默认：'t'） */
  tFunctionName?: string;
}

/**
 * 插件状态
 */
interface PluginState extends PluginPass {
  /** 所有 t 函数的变量名 */
  tFunctionNames: Set<string>;
  /** 是否需要导入 wrapTFunction */
  needsWrapImport: boolean;
  /** useTranslation 调用的元数据 */
  useTranslationCalls: Map<
    NodePath,
    {
      namespace: string | t.Expression;
      keyPrefix: string | t.Expression | null;
    }
  >;
  /** 存储每个 t 函数名对应的 context (namespace:keyPrefix) */
  tFunctionContext: Map<string, string>;
}

/**
 * 从 useTranslation 参数中提取 namespace
 */
function extractNamespace(args: t.CallExpression['arguments']): string | t.Expression {
  // useTranslation(lng, ns, options)
  // 第二个参数是 namespace
  const nsArg = args[1];

  if (!nsArg) {
    return 'common'; // 默认 namespace
  }

  // 字符串字面量
  if (t.isStringLiteral(nsArg)) {
    return nsArg.value;
  }

  // 数组的第一个元素
  if (t.isArrayExpression(nsArg) && nsArg.elements.length > 0) {
    const firstElement = nsArg.elements[0];
    if (firstElement && t.isStringLiteral(firstElement)) {
      return firstElement.value;
    }
  }

  // 运行时变量：返回表达式本身
  return nsArg as t.Expression;
}

/**
 * 从 useTranslation 的 options 参数中提取 keyPrefix
 */
function extractKeyPrefix(args: t.CallExpression['arguments']): string | t.Expression | null {
  // useTranslation(lng, ns, options)
  // 第三个参数是 options
  const optionsArg = args[2];

  if (!optionsArg || !t.isObjectExpression(optionsArg)) {
    return null;
  }

  // 查找 keyPrefix 属性
  const keyPrefixProp = optionsArg.properties.find(
    prop => t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'keyPrefix'
  );

  if (!keyPrefixProp || !t.isObjectProperty(keyPrefixProp)) {
    return null;
  }

  const value = keyPrefixProp.value;

  // 字符串字面量
  if (t.isStringLiteral(value)) {
    return value.value;
  }

  // 运行时变量
  if (t.isIdentifier(value) || t.isMemberExpression(value)) {
    return value;
  }

  return null;
}

/**
 * 构建 context 参数表达式
 * 格式：'namespace' 或 'namespace:keyPrefix'
 */
function buildContextExpression(
  namespace: string | t.Expression,
  keyPrefix: string | t.Expression | null
): t.Expression {
  // 如果没有 keyPrefix，直接返回 namespace
  if (!keyPrefix) {
    return typeof namespace === 'string' ? t.stringLiteral(namespace) : namespace;
  }

  // 如果 namespace 和 keyPrefix 都是字符串字面量
  if (typeof namespace === 'string' && typeof keyPrefix === 'string') {
    return t.stringLiteral(`${namespace}:${keyPrefix}`);
  }

  // 如果有运行时变量，生成模板字符串或条件表达式
  const nsExpr = typeof namespace === 'string' ? t.stringLiteral(namespace) : namespace;

  const prefixExpr = typeof keyPrefix === 'string' ? t.stringLiteral(keyPrefix) : keyPrefix;

  // 生成: keyPrefix ? `${namespace}:${keyPrefix}` : namespace
  return t.conditionalExpression(
    prefixExpr,
    t.templateLiteral(
      [
        t.templateElement({ raw: '', cooked: '' }, false),
        t.templateElement({ raw: ':', cooked: ':' }, false),
        t.templateElement({ raw: '', cooked: '' }, true),
      ],
      [nsExpr, prefixExpr]
    ),
    nsExpr
  );
}

/**
 * 检查是否是 useTranslation 调用
 */
function isUseTranslationCall(node: t.Node, hookName: string): node is t.CallExpression {
  if (t.isCallExpression(node)) {
    const callee = node.callee;
    if (t.isIdentifier(callee) && callee.name === hookName) {
      return true;
    }
  }

  // 支持 await useTranslation (服务端组件)
  if (t.isAwaitExpression(node)) {
    return isUseTranslationCall(node.argument, hookName);
  }

  return false;
}

/**
 * 检查是否是原生 HTML 标签
 */
const HTML_TAGS = new Set([
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'slot',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
]);

function isNativeHTMLTag(name: string): boolean {
  return HTML_TAGS.has(name.toLowerCase());
}

/**
 * 检查是否是 t 函数调用
 */
function isTFunctionCall(node: t.Node, tFunctionNames: Set<string>): node is t.CallExpression {
  if (!t.isCallExpression(node)) {
    return false;
  }

  const callee = node.callee;

  // 直接调用：t('key')
  if (t.isIdentifier(callee) && tFunctionNames.has(callee.name)) {
    return true;
  }

  return false;
}

/**
 * 从 t() 调用中提取翻译 key
 * 返回格式: "namespace:keyPrefix.key" 或 "key"
 */
function extractTranslationKey(
  callExpression: t.CallExpression,
  state: PluginState
): string | null {
  const args = callExpression.arguments;
  if (args.length === 0) {
    return null;
  }

  const firstArg = args[0];

  // 只处理字符串字面量 key
  if (!t.isStringLiteral(firstArg)) {
    return null;
  }

  let key = firstArg.value;
  let namespace = '';

  // 检查第二个参数（options）中的 ns
  const secondArg = args[1];
  if (secondArg && t.isObjectExpression(secondArg)) {
    const nsProperty = secondArg.properties.find(
      prop => t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'ns'
    );

    if (nsProperty && t.isObjectProperty(nsProperty) && t.isStringLiteral(nsProperty.value)) {
      namespace = nsProperty.value.value;
    }
  }

  // 如果 key 本身包含 namespace（格式：ns:key）
  if (key.includes(':')) {
    return key;
  }

  // 从 state 中获取 t 函数的 context
  if (!namespace && t.isIdentifier(callExpression.callee)) {
    const tFuncName = callExpression.callee.name;
    const context = state.tFunctionContext.get(tFuncName);

    if (context) {
      // context 格式: "namespace:keyPrefix" 或 "namespace"
      const [ctxNamespace, ctxKeyPrefix] = context.split(':');
      namespace = ctxNamespace;

      // 如果有 keyPrefix，添加到 key 前面
      if (ctxKeyPrefix) {
        key = `${ctxKeyPrefix}.${key}`;
      }
    }
  }

  // 返回完整的 key
  if (namespace) {
    return `${namespace}:${key}`;
  }

  return key;
}

/**
 * 创建 React-i18next Babel 插件
 */
export function createReactI18nextBabelPlugin(
  options: BabelPluginOptions = {}
): PluginObj<PluginState> {
  const { hookName = 'useTranslation', tFunctionName = 't' } = options;

  return {
    name: 'react-i18next-i18nflow',

    visitor: {
      // 第一阶段：初始化和收集信息
      Program: {
        enter(_path, state) {
          state.tFunctionNames = new Set([tFunctionName]);
          state.needsWrapImport = false;
          state.useTranslationCalls = new Map();
          state.tFunctionContext = new Map();
        },

        exit(path, state) {
          // 如果需要，添加 wrapTFunction 导入
          if (!state.needsWrapImport) {
            return;
          }

          // 检查是否已经有导入
          const hasImport = path.node.body.some(
            node =>
              t.isImportDeclaration(node) &&
              node.source.value === '@i18nflow/react-i18next' &&
              node.specifiers.some(
                spec =>
                  t.isImportSpecifier(spec) &&
                  t.isIdentifier(spec.imported) &&
                  spec.imported.name === 'wrapTFunction'
              )
          );

          if (!hasImport) {
            // 添加导入: import { wrapTFunction as __i18nflow_wrap } from '@i18nflow/react-i18next'
            const importDeclaration = t.importDeclaration(
              [t.importSpecifier(t.identifier('__i18nflow_wrap'), t.identifier('wrapTFunction'))],
              t.stringLiteral('@i18nflow/react-i18next')
            );
            path.unshiftContainer('body', importDeclaration);
          }
        },
      },

      // 处理 useTranslation 调用，包装返回的 t 函数
      VariableDeclarator(path, state) {
        const init = path.node.init;
        if (!init) return;

        // 检查是否是 useTranslation 调用
        let callExpression: t.CallExpression | null = null;

        if (t.isCallExpression(init) && isUseTranslationCall(init, hookName)) {
          callExpression = init;
        } else if (
          t.isAwaitExpression(init) &&
          t.isCallExpression(init.argument) &&
          isUseTranslationCall(init.argument, hookName)
        ) {
          callExpression = init.argument;
        }

        if (!callExpression) return;

        // 提取 namespace 和 keyPrefix
        const namespace = extractNamespace(callExpression.arguments);
        const keyPrefix = extractKeyPrefix(callExpression.arguments);

        // 检查是否是对象解构
        const pattern = path.node.id;
        if (!t.isObjectPattern(pattern)) return;

        // 找到 t 属性
        const tProperty = pattern.properties.find(
          prop =>
            t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === tFunctionName
        );

        if (!tProperty || !t.isObjectProperty(tProperty)) return;
        if (!t.isIdentifier(tProperty.value)) return;

        const tName = tProperty.value.name;

        // 添加到 t 函数名称集合
        state.tFunctionNames.add(tName);

        // 重命名原始 t 为 __i18nflow_t_original
        const originalTName = `__i18nflow_${tName}_original`;
        tProperty.value = t.identifier(originalTName);

        // 构建 context 参数
        const contextArg = buildContextExpression(namespace, keyPrefix);

        // 生成包装代码: const t = __i18nflow_wrap(__i18nflow_t_original, context);
        const wrapperDeclaration = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(tName),
            t.callExpression(t.identifier('__i18nflow_wrap'), [
              t.identifier(originalTName),
              contextArg,
            ])
          ),
        ]);

        // 插入到原语句后面
        path.parentPath.insertAfter(wrapperDeclaration);

        // 保存 t 函数的 context 信息
        if (t.isStringLiteral(contextArg)) {
          state.tFunctionContext.set(tName, contextArg.value);
        }

        // 标记需要导入
        state.needsWrapImport = true;
      },

      // 处理 JSX 子元素中的 t() 调用
      // 注意：JSX 子元素中的 t() 调用不需要包装 String()
      // React 可以直接渲染我们返回的 React 元素（带 data-i18n-key 的 span）
      // 只有在 JSX 属性中才需要 String() 包装
      JSXExpressionContainer(_path, _state) {
        // 不需要对 JSX 子元素中的 t() 调用做任何转换
        // 运行时 proxy 会返回带 data-i18n-key 的 React 元素
        // React 会自动渲染这个元素
      },

      // 处理 JSX 属性中的 t() 调用
      JSXAttribute(path, state) {
        const value = path.node.value;

        // 只处理 JSXExpressionContainer
        if (!t.isJSXExpressionContainer(value)) {
          return;
        }

        const expression = value.expression;

        // 跳过空表达式
        if (t.isJSXEmptyExpression(expression)) {
          return;
        }

        // 跳过已经是 String() 调用
        if (
          t.isCallExpression(expression) &&
          t.isIdentifier(expression.callee, { name: 'String' })
        ) {
          return;
        }

        // 检查是否是 t() 调用
        if (isTFunctionCall(expression, state.tFunctionNames)) {
          // 获取父 JSX 元素
          const jsxOpeningElement = path.findParent(p => p.isJSXOpeningElement());
          if (!jsxOpeningElement || !t.isJSXOpeningElement(jsxOpeningElement.node)) {
            return;
          }

          const openingElement = jsxOpeningElement.node;
          const tagName = t.isJSXIdentifier(openingElement.name) ? openingElement.name.name : '';

          // 只对原生 HTML 标签的属性进行 String() 包装
          // 自定义组件可以接收 React 元素，所以不需要转换
          if (isNativeHTMLTag(tagName)) {
            // 包装 String()
            value.expression = t.callExpression(t.identifier('String'), [expression]);

            // 提取翻译 key 并添加 data-i18n-{attrName} 属性
            const attrName = t.isJSXIdentifier(path.node.name) ? path.node.name.name : '';
            if (attrName && t.isCallExpression(expression)) {
              const translationKey = extractTranslationKey(expression, state);
              if (translationKey) {
                // 添加 data-i18n-{attrName} 属性
                const dataAttrName = `data-i18n-${attrName}`;

                // 检查是否已经存在该属性
                const existingAttr = openingElement.attributes.find(
                  attr =>
                    t.isJSXAttribute(attr) &&
                    t.isJSXIdentifier(attr.name) &&
                    attr.name.name === dataAttrName
                );

                if (!existingAttr) {
                  openingElement.attributes.push(
                    t.jsxAttribute(t.jsxIdentifier(dataAttrName), t.stringLiteral(translationKey))
                  );
                }
              }
            }
          }
        }
      },
    },
  };
}

/**
 * 默认导出
 */
export default createReactI18nextBabelPlugin;
