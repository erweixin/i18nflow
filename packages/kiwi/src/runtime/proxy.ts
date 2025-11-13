/**
 * Kiwi Runtime Proxy
 * 包装 i18n 对象，添加调试功能
 *
 * 开发环境：返回带 data-i18n-key 的 span 元素（React 元素）
 * 生产环境：直接返回字符串
 */

import * as React from 'react';

type ReactElementWithStringMethods = React.ReactElement & {
  toString(): string;
  valueOf(): string;
  [Symbol.toPrimitive](): string;
};

/**
 * 创建 I18N React 元素
 * @param value 翻译文本
 * @param key i18n key
 * @returns 返回带有 data-i18n-key 的 span 元素
 */
function createI18NReactElement(value: string, key: string): ReactElementWithStringMethods {
  // 创建 span 元素，添加 data-i18n-key 属性
  // span 默认就是 inline，不会影响原样式和布局
  const element = React.createElement(
    'span',
    {
      'data-i18n-key': key,
    },
    value
  );

  // 使用 Proxy 包装 React 元素，添加字符串转换方法
  return new Proxy(element, {
    get(target, prop) {
      // 字符串转换方法
      if (prop === 'toString') {
        return () => value;
      }

      if (prop === 'valueOf') {
        return () => value;
      }

      if (prop === Symbol.toPrimitive) {
        return () => value;
      }

      // 其他属性从原元素获取
      return (target as any)[prop];
    },

    has(target, prop) {
      // 确保 toString、valueOf 等属性被识别为存在
      if (prop === 'toString' || prop === 'valueOf' || prop === Symbol.toPrimitive) {
        return true;
      }
      return prop in target;
    },
  }) as any;
}

/**
 * 创建 I18N Proxy，包装 i18n 对象
 * @param target i18n 对象
 * @param keyPath 当前属性路径
 * @returns 代理后的对象
 */
function createI18NProxy<T extends object>(target: T, keyPath: string[] = []): T {
  return new Proxy(target, {
    get(proxyTarget, prop: string | symbol) {
      const propStr = String(prop);

      // 先获取原始值
      const originalValue = Reflect.get(proxyTarget, propStr);

      // 处理 template 方法（只有当原始值是函数时才处理）
      if (propStr === 'template' && typeof originalValue === 'function') {
        return (str: string | React.ReactElement, args: object) => {
          // 如果传入的是 React 元素，提取其 key 和 value
          let templateKey = '';
          let templateValue: string;

          if (React.isValidElement(str)) {
            // 从 React 元素的 props 中提取
            const { props } = str as any;
            templateKey = props?.['data-i18n-key'] || '';
            const { children } = props || {};
            templateValue = typeof children === 'string' ? children : String(children || '');
          } else if (typeof str === 'string') {
            // 如果是字符串，直接使用
            templateValue = str;
            templateKey = '';
          } else {
            // 其他情况，转换为字符串
            templateValue = String(str);
            templateKey = '';
          }

          // 调用原始的 template 方法
          const result = originalValue.call(proxyTarget, templateValue, args);

          // 始终返回带有 data-i18n-key 的 React 元素
          const key = templateKey || '';
          return createI18NReactElement(result, key);
        };
      }

      // 处理其他方法（如 get、setLocale 等）
      if (typeof originalValue === 'function') {
        return originalValue.bind(proxyTarget);
      }

      // 处理属性访问
      const currentKeyPath = [...keyPath, propStr];
      const value = originalValue;

      // 如果是字符串值，始终返回 React 元素（span 包裹）
      if (typeof value === 'string') {
        const key = currentKeyPath.join('.');
        return createI18NReactElement(value, key);
      }

      // 如果值是对象且不是 React 元素，继续代理
      if (
        value &&
        typeof value === 'object' &&
        !React.isValidElement(value) &&
        !Array.isArray(value) &&
        value !== null
      ) {
        // 检查是否是普通对象
        const isPlainObject =
          Object.prototype.toString.call(value) === '[object Object]' ||
          value.constructor === Object ||
          Object.getPrototypeOf(value) === null ||
          Object.getPrototypeOf(value) === Object.prototype;

        if (isPlainObject) {
          return createI18NProxy(value, currentKeyPath);
        }
      }

      // 其他情况直接返回
      return value;
    },
  }) as any;
}

/**
 * 创建 Kiwi Proxy
 * 包装 i18n 对象，使其支持调试功能
 * @param i18nObject 原始 i18n 对象
 * @param _options 配置选项（保留参数以兼容旧版本 API，当前未使用）
 * @returns 代理后的对象
 */
export function createKiwiProxy<T extends object>(
  i18nObject: T,
  _options: {
    debug?: boolean;
    i18nIdentifier?: string;
  } = {}
): T {
  // 始终启用 Proxy，不再根据环境判断
  return createI18NProxy(i18nObject);
}

/**
 * 自动导入的 Proxy 创建函数
 * 由 Babel 插件自动注入
 * @param obj 原始对象
 * @returns 代理后的对象
 */
export function __i18nflow_createProxy<T extends object>(obj: T): T {
  // 始终启用 Proxy
  return createI18NProxy(obj);
}
