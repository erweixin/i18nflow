/**
 * AST 操作工具
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

/**
 * 解析 TypeScript/JavaScript 代码为 AST
 */
export function parseCode(
  code: string,
  options?: parser.ParserOptions
): parser.ParseResult<t.File> {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
    ...options,
  });
}

/**
 * 将 AST 生成代码
 */
export function generateCode(ast: t.Node, options?: any): ReturnType<typeof generate> {
  return generate(
    ast,
    {
      retainLines: false,
      comments: true,
      jsescOption: {
        minimal: true, // 保留 Unicode 字符，不转义
      },
      ...options,
    },
    ''
  );
}

/**
 * 从 MemberExpression 构建完整的 key 路径
 * 例如: I18N.components.title -> "I18N.components.title"
 */
export function buildKeyFromMemberExpression(node: t.Node): string | null {
  const parts: string[] = [];
  let current: t.Node = node;

  while (t.isMemberExpression(current)) {
    if (t.isIdentifier(current.property)) {
      parts.unshift(current.property.name);
    } else {
      return null; // 不支持计算属性
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
export function getPropertyKey(prop: t.ObjectProperty | t.ObjectMethod): string | null {
  if (t.isIdentifier(prop.key)) {
    return prop.key.name;
  }
  if (t.isStringLiteral(prop.key)) {
    return prop.key.value;
  }
  return null;
}

/**
 * 检查表达式是否是特定的标识符调用
 * 例如: I18N.xxx 或 I18N.template(...)
 */
export function isIdentifierExpression(expression: t.Node, identifier: string): boolean {
  // 处理 I18N.xxx 形式
  if (t.isMemberExpression(expression)) {
    const key = buildKeyFromMemberExpression(expression);
    return key?.startsWith(`${identifier}.`) ?? false;
  }

  // 处理 I18N.template(...) 形式
  if (t.isCallExpression(expression)) {
    const callee = expression.callee;
    if (t.isMemberExpression(callee) && t.isIdentifier(callee.object, { name: identifier })) {
      return true;
    }
  }

  return false;
}

/**
 * 递归查找对象中指定路径的属性值
 */
export function findPropertyValue(
  objectExpression: t.ObjectExpression,
  propertyPath: string[]
): string | null {
  if (propertyPath.length === 0) {
    return null;
  }

  const [currentKey, ...restPath] = propertyPath;

  for (const prop of objectExpression.properties) {
    if (t.isObjectProperty(prop)) {
      const keyName = getPropertyKey(prop);

      if (keyName === currentKey) {
        if (restPath.length > 0) {
          if (t.isObjectExpression(prop.value)) {
            return findPropertyValue(prop.value, restPath);
          }
        } else {
          if (t.isStringLiteral(prop.value)) {
            return prop.value.value;
          }
        }
      }
    }
  }

  return null;
}

/**
 * 递归更新对象属性值
 */
export function updateProperty(
  objectExpression: t.ObjectExpression,
  propertyPath: string[],
  newValue: string
): boolean {
  if (propertyPath.length === 0) {
    return false;
  }

  const [currentKey, ...restPath] = propertyPath;

  for (const prop of objectExpression.properties) {
    if (t.isObjectProperty(prop) || t.isObjectMethod(prop)) {
      const keyName = getPropertyKey(prop);

      if (keyName === currentKey) {
        // 如果还有更深的路径，继续递归
        if (restPath.length > 0) {
          if (t.isObjectProperty(prop) && t.isObjectExpression(prop.value)) {
            return updateProperty(prop.value, restPath, newValue);
          }
        } else {
          // 找到目标属性，更新值
          if (t.isObjectProperty(prop)) {
            prop.value = t.stringLiteral(newValue);
            return true;
          }
        }
      }
    }
  }

  return false;
}

// 导出 Babel 相关工具
export { traverse, t };
