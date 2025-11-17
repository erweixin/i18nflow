/**
 * React-i18next Runtime Proxy
 * 为 t 函数添加调试功能，在开发环境返回带 data-i18n-key 的 React 元素
 *
 * 核心功能：
 * 1. 包装 t 函数，捕获翻译调用
 * 2. 构建完整的 i18n key (namespace:keyPrefix.key)
 * 3. 返回带 data-i18n-key 的 React 元素（开发环境）或字符串（生产环境）
 */

import * as React from 'react';
import type { TFunction } from 'i18next';

/**
 * React 元素类型，支持字符串转换方法
 */
type ReactElementWithStringMethods = React.ReactElement & {
  toString(): string;
  valueOf(): string;
  [Symbol.toPrimitive](hint: string): string;
};

/**
 * 创建带 data-i18n-key 的 React 元素
 *
 * @param value - 翻译后的文本值
 * @param key - 完整的 i18n key (例如: 'common:users.name')
 * @returns 开发环境返回 React 元素，生产环境返回字符串
 */
function createI18nReactElement(
  value: string,
  key: string
): string | ReactElementWithStringMethods {
  // 检查环境：开发环境启用调试功能
  const isDev = process.env.NODE_ENV !== 'production';

  // 生产环境：直接返回字符串
  if (!isDev) {
    return value;
  }

  // 开发环境：创建带 data-i18n-key 的 span 元素
  const element = React.createElement('span', { 'data-i18n-key': key }, value);

  // 使用 Proxy 包装 React 元素，让它能像字符串一样使用
  // 这样在需要字符串的地方（如原生 HTML 属性）可以自动转换
  return new Proxy(element, {
    get(target, prop) {
      // 字符串转换方法：返回原始文本
      if (prop === 'toString') {
        return () => value;
      }
      if (prop === 'valueOf') {
        return () => value;
      }
      if (prop === Symbol.toPrimitive) {
        return () => value;
      }
      // 其他属性从 React 元素获取
      return (target as any)[prop];
    },
    has(target, prop) {
      // 确保字符串方法被识别为存在
      if (prop === 'toString' || prop === 'valueOf' || prop === Symbol.toPrimitive) {
        return true;
      }
      return prop in target;
    },
  }) as ReactElementWithStringMethods;
}

/**
 * 构建完整的 i18n key
 *
 * @param key - 原始 key
 * @param namespace - 命名空间
 * @param keyPrefix - key 前缀
 * @param options - t 函数的 options 参数
 * @returns 完整的 key (格式: namespace:keyPrefix.key)
 */
function buildFullKey(key: string, namespace: string, keyPrefix: string, options?: any): string {
  // 如果 key 已经包含命名空间（格式：ns:key），直接返回
  if (key.includes(':')) {
    return key;
  }

  // 如果 options 中指定了 ns，优先使用
  let actualNamespace = namespace;
  if (options && typeof options === 'object' && 'ns' in options) {
    actualNamespace = options.ns;
  }

  // 构建完整的 key
  let fullKey = key;

  // 添加 keyPrefix
  if (keyPrefix) {
    fullKey = `${keyPrefix}.${key}`;
  }

  // 添加 namespace
  if (actualNamespace) {
    fullKey = `${actualNamespace}:${fullKey}`;
  }

  return fullKey;
}

/**
 * 包装 t 函数，添加调试功能
 *
 * @param originalT - 原始的 t 函数
 * @param context - 上下文信息，格式：'namespace' 或 'namespace:keyPrefix'
 * @returns 包装后的 t 函数
 *
 * @example
 * ```typescript
 * const { t: originalT } = useTranslation('en', 'common', { keyPrefix: 'users' });
 * const t = wrapTFunction(originalT, 'common:users');
 *
 * // 调用 t('name') 会返回带 data-i18n-key="common:users.name" 的 React 元素
 * const result = t('name');
 * ```
 */
export function wrapTFunction(originalT: TFunction, context?: string): TFunction {
  // 检查环境：开发环境启用调试功能
  const isDev = process.env.NODE_ENV !== 'production';

  // 生产环境：直接返回原函数，零性能开销
  if (!isDev) {
    return originalT;
  }

  // 解析 context 参数
  // 格式：'namespace' 或 'namespace:keyPrefix'
  let namespace = '';
  let keyPrefix = '';

  if (context) {
    const parts = context.split(':');
    namespace = parts[0] || '';
    keyPrefix = parts[1] || '';
  }

  // 创建包装后的 t 函数
  const wrappedT = (key: any, options?: any): any => {
    // 1. 调用原始 t 函数获取翻译结果
    const result = originalT(key, options);

    // 2. 如果结果不是字符串，直接返回（可能是对象、数组等）
    if (typeof result !== 'string') {
      return result;
    }

    // 3. 构建完整的 i18n key
    const fullKey = buildFullKey(
      typeof key === 'string' ? key : String(key),
      namespace,
      keyPrefix,
      options
    );

    // 4. 返回包装后的 React 元素
    return createI18nReactElement(result, fullKey);
  };

  // 复制原函数的原型和属性
  // 这样包装后的函数保持与原函数相同的类型和行为
  Object.setPrototypeOf(wrappedT, Object.getPrototypeOf(originalT));

  // 复制所有可枚举属性
  Object.keys(originalT).forEach(k => {
    if (k !== 'length' && k !== 'name' && k !== 'prototype') {
      (wrappedT as any)[k] = (originalT as any)[k];
    }
  });

  return wrappedT as TFunction;
}
