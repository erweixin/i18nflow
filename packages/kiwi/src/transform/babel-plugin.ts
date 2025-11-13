/**
 * Kiwi Babel 插件：在开发环境下处理 I18N 调用
 *
 * 转换规则：
 * 1. JSX 子元素 - 直接 I18N 调用:
 *    <div>{I18N.components.title}</div> → <div>{String(I18N.components.title)}</div>
 *
 * 2. JSX 子元素 - 变量引用:
 *    const items = [{ label: I18N.xxx }]; <div>{item.label}</div> → <div>{item.label}</div>
 *    (保持不变，渲染 Proxy 返回的 span 元素)
 *
 * 3. 原生 HTML 标签的字符串属性:
 *    <input placeholder={I18N.xxx} /> → <input placeholder={String(I18N.xxx)} />
 *    (只转换原生标签：input, div, span 等)
 *
 * 4. 自定义组件的属性:
 *    <Card title={I18N.xxx} /> → <Card title={I18N.xxx} />
 *    (保持不变，允许 Proxy 返回的 React 元素通过 props 传递)
 *
 * 5. 对象属性值:
 *    { name: I18N.chart.title } → { name: I18N.chart.title }
 *    (保持不变，Proxy 会自动处理类型转换)
 *
 * 6. 箭头函数返回:
 *    formatter: () => I18N.template(...) → formatter: () => String(I18N.template(...))
 *
 * 关键设计：
 * - 原生 HTML 标签（小写开头）的属性需要字符串，添加 String()
 * - 自定义组件（大写开头）可以接收 React Node，保留 Proxy 返回的 span 元素
 * - Proxy 实现了 toString/valueOf/Symbol.toPrimitive，在需要时自动转换为字符串
 * - 同时在父元素上添加 data-i18n-key 属性用于调试
 */

import type { PluginObj, PluginPass } from '@babel/core';
import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';

interface I18nReference {
  type: 'direct' | 'array' | 'object';
  key?: string;
  elements?: Map<number, Record<string, string>>;
  properties?: Record<string, string>;
}

interface PluginState extends PluginPass {
  i18nReferences: Map<string, I18nReference>;
}

interface KiwiBabelPluginOptions {
  /** i18n 对象名称 */
  i18nIdentifier?: string;
}

/**
 * 创建 Kiwi Babel 插件
 */
export function createKiwiBabelPlugin(
  options: KiwiBabelPluginOptions = {}
): PluginObj<PluginState> {
  const { i18nIdentifier = 'I18N' } = options;

  return {
    name: 'kiwi-i18n-debug',
    visitor: {
      // 第一阶段：收集所有包含 I18N 的变量声明
      Program: {
        enter(programPath, state) {
          // 存储 I18N 引用的映射
          state.i18nReferences = new Map();

          // 遍历所有变量声明
          programPath.traverse({
            VariableDeclarator(path) {
              collectI18nReferences(path, state, i18nIdentifier);
            },
          });
        },
      },

      // 处理 JSX 表达式容器（JSX 子元素中的表达式）
      JSXExpressionContainer(path, state) {
        const expression = path.node.expression;

        // 检查这个表达式容器是否在 JSXAttribute 中
        const isInJSXAttribute = path.findParent(p => p.isJSXAttribute());

        // 如果在 JSXAttribute 中，应该由 JSXAttribute 处理器来处理，这里跳过
        if (isInJSXAttribute) {
          return;
        }

        // 跳过 JSXEmptyExpression
        if (t.isJSXEmptyExpression(expression)) {
          return;
        }

        // 跳过已经是方法调用的表达式（如 String()）
        if (t.isCallExpression(expression) || t.isOptionalCallExpression(expression)) {
          const callee = expression.callee;
          if (t.isIdentifier(callee, { name: 'String' })) {
            return;
          }
        }

        // 1. 直接的 I18N 调用
        if (isI18NExpression(expression, i18nIdentifier)) {
          const i18nKey = extractI18nKey(expression, i18nIdentifier);
          if (i18nKey) {
            // 在父元素上添加 data-i18n-key 属性
            const jsxOpeningElement = path.findParent(
              p => p.isJSXOpeningElement() || p.isJSXElement()
            );
            if (jsxOpeningElement) {
              const openingElement = jsxOpeningElement.isJSXOpeningElement()
                ? jsxOpeningElement.node
                : (jsxOpeningElement.node as t.JSXElement).openingElement;
              if (openingElement && t.isJSXOpeningElement(openingElement)) {
                addDataI18nKeyAttribute(openingElement, i18nKey);
              }
            }
            // 转换为 String(I18N.xx.yy)
            path.node.expression = t.callExpression(t.identifier('String'), [expression]);
            return;
          }
        }

        // 2. 变量引用
        // 注意：不再在 JSX 子元素中对变量引用添加 String()
        // 这样可以保留 Proxy 返回的 React 元素（带 data-i18n-key）
        // 只添加 data-i18n-key 到父元素，用于调试
        if (isI18NValueReference(expression, state, path)) {
          const refKey = extractI18nFromReference(expression, state, path);
          if (refKey) {
            const jsxOpeningElement = path.findParent(
              p => p.isJSXOpeningElement() || p.isJSXElement()
            );
            if (jsxOpeningElement) {
              const openingElement = jsxOpeningElement.isJSXOpeningElement()
                ? jsxOpeningElement.node
                : (jsxOpeningElement.node as t.JSXElement).openingElement;
              if (openingElement && t.isJSXOpeningElement(openingElement)) {
                addDataI18nKeyAttribute(openingElement, refKey);
              }
            }
            // 不添加 String()，保持 Proxy 返回的 React 元素
            return;
          }
        }
      },

      // 处理 JSX 属性中的 I18N 调用
      JSXAttribute(path, state) {
        // 如果是 data-i18n-key 属性，跳过
        if (t.isJSXIdentifier(path.node.name) && path.node.name.name === 'data-i18n-key') {
          return;
        }

        if (t.isJSXExpressionContainer(path.node.value)) {
          const expression = path.node.value.expression;

          // 跳过 JSXEmptyExpression
          if (t.isJSXEmptyExpression(expression)) {
            return;
          }

          // 获取属性名称
          const attrName = t.isJSXIdentifier(path.node.name) ? path.node.name.name : '';

          // 获取 JSX 元素（父节点）
          const jsxOpeningElement = path.findParent(
            p => p.isJSXOpeningElement() || p.isJSXElement()
          );

          // 检查父元素是否已经有 data-i18n-key 属性
          // 如果有，说明已经处理过了，跳过（避免因为添加属性触发重新遍历）
          if (jsxOpeningElement) {
            const openingElement = jsxOpeningElement.isJSXOpeningElement()
              ? jsxOpeningElement.node
              : (jsxOpeningElement.node as t.JSXElement).openingElement;

            if (openingElement && t.isJSXOpeningElement(openingElement)) {
              const hasDataKey = openingElement.attributes.some(
                attr =>
                  t.isJSXAttribute(attr) &&
                  t.isJSXIdentifier(attr.name) &&
                  attr.name.name === 'data-i18n-key'
              );
              if (hasDataKey) {
                return;
              }
            }
          }

          let isNativeHTMLElement = false;
          let tagName = '';
          if (jsxOpeningElement) {
            const openingElement = jsxOpeningElement.isJSXOpeningElement()
              ? jsxOpeningElement.node
              : (jsxOpeningElement.node as t.JSXElement).openingElement;

            if (openingElement && t.isJSXOpeningElement(openingElement)) {
              tagName = t.isJSXIdentifier(openingElement.name) ? openingElement.name.name : '';
              // 原生 HTML 标签是小写开头，自定义组件是大写开头
              isNativeHTMLElement = tagName.length > 0 && tagName[0] === tagName[0].toLowerCase();
            }
          }

          // 检查表达式是否已经被 String() 包裹
          if (
            t.isCallExpression(expression) &&
            t.isIdentifier(expression.callee, { name: 'String' })
          ) {
            return;
          }

          // 先检查是否是 I18N 相关的表达式
          const isI18N = isI18NExpression(expression, i18nIdentifier);
          const isI18NRef = isI18NValueReference(expression, state, path);

          if (!isI18N && !isI18NRef) {
            // 不是 I18N 相关的表达式，不处理
            return;
          }

          // 只在原生 HTML 标签的字符串属性中转换为 String()
          const stringAttributes = [
            'placeholder',
            'title',
            'aria-label',
            'alt',
            'value',
            'defaultValue',
            'name',
            'id',
            'htmlFor',
          ];

          if (isNativeHTMLElement && stringAttributes.includes(attrName)) {
            // 如果是 I18N 调用，转换为字符串
            if (isI18N) {
              const i18nKey = extractI18nKey(expression, i18nIdentifier);
              if (i18nKey && jsxOpeningElement) {
                const openingElement = jsxOpeningElement.isJSXOpeningElement()
                  ? jsxOpeningElement.node
                  : (jsxOpeningElement.node as t.JSXElement).openingElement;
                if (openingElement && t.isJSXOpeningElement(openingElement)) {
                  addDataI18nKeyAttribute(openingElement, i18nKey);
                }
              }
              path.node.value.expression = t.callExpression(t.identifier('String'), [expression]);
              return;
            }

            // 如果是变量引用，也转换为字符串
            if (isI18NRef) {
              const refKey = extractI18nFromReference(expression, state, path);
              if (refKey && jsxOpeningElement) {
                const openingElement = jsxOpeningElement.isJSXOpeningElement()
                  ? jsxOpeningElement.node
                  : (jsxOpeningElement.node as t.JSXElement).openingElement;
                if (openingElement && t.isJSXOpeningElement(openingElement)) {
                  addDataI18nKeyAttribute(openingElement, refKey);
                }
              }
              path.node.value.expression = t.callExpression(t.identifier('String'), [expression]);
              return;
            }
          }

          // 对于自定义组件的属性，不添加 String()，只添加 data-i18n-key 到父元素
          if (!isNativeHTMLElement) {
            if (isI18N) {
              const i18nKey = extractI18nKey(expression, i18nIdentifier);
              if (i18nKey && jsxOpeningElement) {
                const openingElement = jsxOpeningElement.isJSXOpeningElement()
                  ? jsxOpeningElement.node
                  : (jsxOpeningElement.node as t.JSXElement).openingElement;
                if (openingElement && t.isJSXOpeningElement(openingElement)) {
                  addDataI18nKeyAttribute(openingElement, i18nKey);
                }
              }
              // 不添加 String()，保持原样
              return;
            }

            if (isI18NRef) {
              const refKey = extractI18nFromReference(expression, state, path);
              if (refKey && jsxOpeningElement) {
                const openingElement = jsxOpeningElement.isJSXOpeningElement()
                  ? jsxOpeningElement.node
                  : (jsxOpeningElement.node as t.JSXElement).openingElement;
                if (openingElement && t.isJSXOpeningElement(openingElement)) {
                  addDataI18nKeyAttribute(openingElement, refKey);
                }
              }
              // 不添加 String()，保持原样
              return;
            }
          }
        }
      },

      // 处理对象属性中的 I18N 调用
      // 注意：不再在对象属性中添加 String() 包装
      // Proxy 已经实现了 toString/valueOf/Symbol.toPrimitive，可以自动转换
      // 保留此处理器主要用于处理函数返回值的场景
      ObjectProperty(path) {
        const value = path.node.value;

        // 处理箭头函数/函数表达式返回 I18N
        if (t.isArrowFunctionExpression(value) || t.isFunctionExpression(value)) {
          // 处理隐式返回的箭头函数
          if (
            t.isArrowFunctionExpression(value) &&
            !t.isBlockStatement(value.body) &&
            isI18NExpression(value.body, i18nIdentifier)
          ) {
            value.body = t.callExpression(t.identifier('String'), [value.body]);
            return;
          }

          // 处理显式 return 语句中的 I18N
          path.traverse({
            ReturnStatement(returnPath) {
              const argument = returnPath.node.argument;
              if (argument && isI18NExpression(argument, i18nIdentifier)) {
                if (
                  !t.isCallExpression(argument) ||
                  !t.isIdentifier(argument.callee, { name: 'String' })
                ) {
                  returnPath.node.argument = t.callExpression(t.identifier('String'), [argument]);
                }
              }
            },
          });
        }
      },
    },
  };
}

/**
 * 收集变量声明中的 I18N 引用
 */
function collectI18nReferences(
  path: NodePath<t.VariableDeclarator>,
  state: PluginState,
  i18nIdentifier: string
): void {
  const { node } = path;

  if (!t.isIdentifier(node.id)) return;

  const variableName = node.id.name;
  const init = node.init;

  if (!init) return;

  // 处理直接赋值
  const directKey = extractI18nKey(init, i18nIdentifier);
  if (directKey) {
    state.i18nReferences.set(variableName, {
      type: 'direct',
      key: directKey,
    });
    return;
  }

  // 处理数组初始化
  if (t.isArrayExpression(init)) {
    const i18nMap = new Map<number, Record<string, string>>();

    init.elements.forEach((element, index) => {
      if (element && t.isObjectExpression(element)) {
        element.properties.forEach(prop => {
          if (t.isObjectProperty(prop) && !t.isPrivateName(prop.key)) {
            const key = getPropertyKey(prop);
            const i18nKey = extractI18nKey(prop.value, i18nIdentifier);

            if (key && i18nKey) {
              if (!i18nMap.has(index)) {
                i18nMap.set(index, {});
              }
              const obj = i18nMap.get(index);
              if (obj) {
                obj[key] = i18nKey;
              }
            }
          }
        });
      }
    });

    if (i18nMap.size > 0) {
      state.i18nReferences.set(variableName, {
        type: 'array',
        elements: i18nMap,
      });
    }
  }

  // 处理对象初始化
  if (t.isObjectExpression(init)) {
    const i18nMap: Record<string, string> = {};

    init.properties.forEach(prop => {
      if (t.isObjectProperty(prop) && !t.isPrivateName(prop.key)) {
        const key = getPropertyKey(prop);
        const i18nKey = extractI18nKey(prop.value, i18nIdentifier);

        if (key && i18nKey) {
          i18nMap[key] = i18nKey;
        }
      }
    });

    if (Object.keys(i18nMap).length > 0) {
      state.i18nReferences.set(variableName, {
        type: 'object',
        properties: i18nMap,
      });
    }
  }
}

/**
 * 从变量引用中提取 I18N key
 */
function extractI18nFromReference(
  expression: t.Node,
  state: PluginState,
  path: NodePath<any>
): string | null {
  if (t.isMemberExpression(expression)) {
    if (t.isIdentifier(expression.object) && t.isIdentifier(expression.property)) {
      const objectName = expression.object.name;
      const propertyName = expression.property.name;

      const binding = findVariableBinding(path, objectName);

      if (binding) {
        const sourceVariable = binding.sourceVariable;
        const ref = state.i18nReferences.get(sourceVariable);

        if (ref) {
          if (ref.type === 'array' && ref.elements) {
            const keys: string[] = [];
            ref.elements.forEach(props => {
              if (props[propertyName]) {
                keys.push(props[propertyName]);
              }
            });

            if (keys.length > 0) {
              return keys.length === 1 ? keys[0] : keys.join('|');
            }
          }

          if (ref.type === 'object' && ref.properties) {
            return ref.properties[propertyName] || null;
          }
        }
      }
    }
  }

  return null;
}

/**
 * 查找变量绑定
 */
function findVariableBinding(
  jsxPath: NodePath<any>,
  varName: string
): { sourceVariable: string; paramName: string } | null {
  let current = jsxPath;

  while (current) {
    const parent = current.parentPath;
    if (!parent) break;

    const node = parent.node;

    if (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) {
      const params = node.params;
      for (const param of params) {
        if (t.isIdentifier(param) && param.name === varName) {
          const grandParent = parent.parentPath;
          if (grandParent && t.isCallExpression(grandParent.node)) {
            const callExpr = grandParent.node;
            const callee = callExpr.callee;

            if (t.isMemberExpression(callee)) {
              const methodName = t.isIdentifier(callee.property) ? callee.property.name : null;

              if (methodName === 'map' || methodName === 'forEach') {
                if (t.isIdentifier(callee.object)) {
                  return {
                    sourceVariable: callee.object.name,
                    paramName: varName,
                  };
                }
              }
            }
          }
        }
      }
    }

    current = parent;
  }

  return null;
}

/**
 * 检查表达式是否是 I18N 调用
 */
function isI18NExpression(expression: t.Node, i18nIdentifier: string): boolean {
  // 处理 I18N.category.key 形式
  if (t.isMemberExpression(expression)) {
    const key = buildKeyFromMemberExpression(expression);
    if (key && key.startsWith(`${i18nIdentifier}.`)) {
      return true;
    }
  }

  // 处理 I18N.template(...) 和 I18N.template?.(...) 形式
  if (t.isCallExpression(expression) || t.isOptionalCallExpression(expression)) {
    const callee = expression.callee;

    // 处理 I18N.template(...) 或 I18N.template?.(...)
    if (
      t.isMemberExpression(callee) &&
      t.isIdentifier(callee.object, { name: i18nIdentifier }) &&
      t.isIdentifier(callee.property, { name: 'template' })
    ) {
      return true;
    }

    // 处理 I18N?.template(...) 或 I18N?.template?.(...)
    if (
      t.isOptionalMemberExpression(callee) &&
      t.isIdentifier(callee.object, { name: i18nIdentifier }) &&
      t.isIdentifier(callee.property, { name: 'template' })
    ) {
      return true;
    }
  }

  return false;
}

/**
 * 检查表达式是否是 I18N 变量引用
 */
function isI18NValueReference(
  expression: t.Node,
  state: PluginState,
  path: NodePath<any>
): boolean {
  // 处理 MemberExpression
  if (t.isMemberExpression(expression)) {
    if (t.isIdentifier(expression.object) && t.isIdentifier(expression.property)) {
      const objectName = expression.object.name;
      const propertyName = expression.property.name;

      const binding = findVariableBinding(path, objectName);

      if (binding) {
        const sourceVariable = binding.sourceVariable;
        const ref = state.i18nReferences.get(sourceVariable);

        if (ref) {
          if (ref.type === 'array' && ref.elements) {
            for (const props of ref.elements.values()) {
              if (props[propertyName]) {
                return true;
              }
            }
          }

          if (ref.type === 'object' && ref.properties) {
            if (ref.properties[propertyName]) {
              return true;
            }
          }
        }
      }
    }
  }

  // 处理直接变量引用
  if (t.isIdentifier(expression)) {
    const varName = expression.name;
    const ref = state.i18nReferences.get(varName);
    if (ref && ref.type === 'direct') {
      return true;
    }
  }

  return false;
}

/**
 * 从表达式中提取 I18N key
 */
function extractI18nKey(expression: t.Node, i18nIdentifier: string): string | null {
  // 处理 I18N.category.key 形式
  if (t.isMemberExpression(expression)) {
    const key = buildKeyFromMemberExpression(expression);
    if (key && key.startsWith(`${i18nIdentifier}.`)) {
      return key.substring(i18nIdentifier.length + 1);
    }
  }

  // 处理 I18N.template(...) 和 I18N.template?.(...) 形式
  if (t.isCallExpression(expression) || t.isOptionalCallExpression(expression)) {
    const callee = expression.callee;

    // 检查是否是 I18N.template(...) 或 I18N.template?.(...)
    const isTemplateCall =
      (t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object, { name: i18nIdentifier }) &&
        t.isIdentifier(callee.property, { name: 'template' })) ||
      (t.isOptionalMemberExpression(callee) &&
        t.isIdentifier(callee.object, { name: i18nIdentifier }) &&
        t.isIdentifier(callee.property, { name: 'template' }));

    if (isTemplateCall) {
      const firstArg = expression.arguments[0];

      // 处理第一个参数是 MemberExpression 的情况
      if (firstArg && t.isMemberExpression(firstArg)) {
        const key = buildKeyFromMemberExpression(firstArg);
        if (key && key.startsWith(`${i18nIdentifier}.`)) {
          return key.substring(i18nIdentifier.length + 1);
        }
      }

      // 处理第一个参数是 OptionalMemberExpression 的情况
      if (firstArg && t.isOptionalMemberExpression(firstArg)) {
        const key = buildKeyFromOptionalMemberExpression(firstArg);
        if (key && key.startsWith(`${i18nIdentifier}.`)) {
          return key.substring(i18nIdentifier.length + 1);
        }
      }
    }
  }

  return null;
}

/**
 * 从 MemberExpression 构建完整的 key 路径
 */
function buildKeyFromMemberExpression(node: t.Node): string | null {
  const parts: string[] = [];
  let current: t.Node = node;

  while (t.isMemberExpression(current)) {
    if (t.isIdentifier(current.property)) {
      parts.unshift(current.property.name);
    } else {
      return null;
    }
    current = current.object;
  }

  if (t.isIdentifier(current)) {
    parts.unshift(current.name);
  } else {
    return null;
  }

  return parts.join('.');
}

/**
 * 从 OptionalMemberExpression 构建完整的 key 路径
 */
function buildKeyFromOptionalMemberExpression(node: t.Node): string | null {
  const parts: string[] = [];
  let current: t.Node = node;

  while (t.isOptionalMemberExpression(current) || t.isMemberExpression(current)) {
    if (t.isIdentifier(current.property)) {
      parts.unshift(current.property.name);
    } else {
      return null;
    }
    current = current.object;
  }

  if (t.isIdentifier(current)) {
    parts.unshift(current.name);
  } else {
    return null;
  }

  return parts.join('.');
}

/**
 * 获取对象属性的 key
 */
function getPropertyKey(prop: t.ObjectProperty | t.ObjectMethod): string | null {
  if (t.isIdentifier(prop.key)) {
    return prop.key.name;
  }
  if (t.isStringLiteral(prop.key)) {
    return prop.key.value;
  }
  return null;
}

/**
 * 为 JSX 元素添加 data-i18n-key 属性
 */
function addDataI18nKeyAttribute(openingElement: t.JSXOpeningElement, i18nKey: string): void {
  // 检查是否已经有 data-i18n-key 属性
  const hasDataKey = openingElement.attributes.some(
    attr =>
      t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'data-i18n-key'
  );

  if (!hasDataKey) {
    openingElement.attributes.push(
      t.jsxAttribute(t.jsxIdentifier('data-i18n-key'), t.stringLiteral(i18nKey))
    );
  }
}
