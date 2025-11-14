/**
 * Runtime Proxy 单元测试
 * 测试 createKiwiProxy 的所有功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as React from 'react';
import { createKiwiProxy } from '../proxy';

// 模拟环境变量
const originalEnv = process.env.NODE_ENV;

// 模拟 kiwi-intl 对象
interface MockI18nObject {
  common: {
    hello: string;
    world: string;
  };
  examples: {
    template: {
      helloUser: string;
      userInfo: string;
    };
    basic: {
      title: string;
    };
  };
  nested: {
    level1: {
      level2: {
        level3: string;
      };
    };
  };
  template?: (str: string, args: Record<string, any>) => string;
  setLang?: (lang: string) => void;
  get?: (key: string) => string;
}

describe('Runtime Proxy - createKiwiProxy', () => {
  let mockI18n: MockI18nObject;

  beforeEach(() => {
    // 重置环境变量
    process.env.NODE_ENV = 'development';

    // 创建模拟的 i18n 对象
    mockI18n = {
      common: {
        hello: 'Hello',
        world: 'World',
      },
      examples: {
        template: {
          helloUser: 'Hello, {username}!',
          userInfo: 'User {name} is {age} years old',
        },
        basic: {
          title: 'Basic Title',
        },
      },
      nested: {
        level1: {
          level2: {
            level3: 'Deep Value',
          },
        },
      },
      template: (str: string, args: Record<string, any>) => {
        return str.replace(/\{(.+?)\}/g, (match, key) => {
          return args[key] || match;
        });
      },
      setLang: vi.fn(),
      get: vi.fn((key: string) => `value_${key}`),
    };
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('基本属性访问', () => {
    it('应该返回字符串值', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello;

      // 在开发环境下应该返回 React 元素
      expect(React.isValidElement(result)).toBe(true);
    });

    it('应该在生产环境下返回纯字符串', () => {
      process.env.NODE_ENV = 'production';
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello;

      expect(typeof result).toBe('string');
      expect(result).toBe('Hello');
    });

    it('应该访问嵌套属性', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.world;

      expect(React.isValidElement(result)).toBe(true);
    });

    it('应该访问深层嵌套属性', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.nested.level1.level2.level3;

      expect(React.isValidElement(result)).toBe(true);
    });
  });

  describe('React 元素和 data-i18n-key', () => {
    it('应该在 React 元素上添加 data-i18n-key 属性', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello as any;

      expect(React.isValidElement(result)).toBe(true);
      expect(result.props['data-i18n-key']).toBe('common.hello');
    });

    it('应该为嵌套路径生成正确的 key', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.nested.level1.level2.level3 as any;

      expect(result.props['data-i18n-key']).toBe('nested.level1.level2.level3');
    });

    it('应该在 React 元素的 children 中包含原始文本', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello as any;

      expect(result.props.children).toBe('Hello');
    });
  });

  describe('字符串转换方法', () => {
    it('应该支持 toString() 方法', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello;

      expect(result.toString()).toBe('Hello');
    });

    it('应该支持 valueOf() 方法', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello;

      expect(result.valueOf()).toBe('Hello');
    });

    it('应该支持 Symbol.toPrimitive', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello as any;

      expect(result[Symbol.toPrimitive]()).toBe('Hello');
    });

    it('应该在字符串上下文中自动转换', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello;

      // 字符串拼接
      const concatenated = `Greeting: ${result}`;
      expect(concatenated).toBe('Greeting: Hello');
    });
  });

  describe('Template 方法', () => {
    it('应该正确调用 template 方法', () => {
      const proxy = createKiwiProxy(mockI18n);
      const template = proxy.examples.template.helloUser;
      const result = proxy.template?.(template as any, { username: 'Alice' });

      expect(React.isValidElement(result)).toBe(true);
      if (React.isValidElement(result)) {
        expect((result.props as { children: string }).children).toBe('Hello, Alice!');
      }
    });

    it('应该从 React 元素中提取 template key', () => {
      const proxy = createKiwiProxy(mockI18n);
      const template = proxy.examples.template.helloUser;
      const result = proxy.template?.(template as any, { username: 'Bob' }) as any;

      expect(result.props['data-i18n-key']).toBe('examples.template.helloUser');
    });

    it('应该支持直接传入字符串', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.template?.('Hello, {name}!', { name: 'Charlie' });

      expect(React.isValidElement(result)).toBe(true);
      if (React.isValidElement(result)) {
        expect(result.props.children).toBe('Hello, Charlie!');
      }
    });

    it('应该在生产环境下返回纯字符串', () => {
      process.env.NODE_ENV = 'production';
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.template?.('Hello, {name}!', { name: 'David' });

      expect(typeof result).toBe('string');
      expect(result).toBe('Hello, David!');
    });

    it('应该支持多个变量替换', () => {
      const proxy = createKiwiProxy(mockI18n);
      const template = proxy.examples.template.userInfo;
      const result = proxy.template?.(template as any, { name: 'Eve', age: 25 }) as any;

      expect(result.props.children).toBe('User Eve is 25 years old');
    });
  });

  describe('区分 template 方法和 template 对象', () => {
    it('应该正确访问 template 对象属性', () => {
      const proxy = createKiwiProxy(mockI18n);

      // I18N.examples.template 是一个对象
      const templateObj = proxy.examples.template;
      expect(typeof templateObj).toBe('object');

      // 可以访问其子属性
      const helloUser = templateObj.helloUser;
      expect(React.isValidElement(helloUser)).toBe(true);
    });

    it('应该正确调用 template 方法', () => {
      const proxy = createKiwiProxy(mockI18n);

      // I18N.template 是一个方法
      const templateMethod = proxy.template;
      expect(typeof templateMethod).toBe('function');

      // 可以调用该方法
      const result = templateMethod?.('Test {value}', { value: 'Success' });
      expect(React.isValidElement(result)).toBe(true);
    });

    it('应该能够组合使用 template 对象和方法', () => {
      const proxy = createKiwiProxy(mockI18n);

      // 先访问对象属性
      const templateText = proxy.examples.template.helloUser;

      // 再使用 template 方法
      const result = proxy.template?.(templateText as any, { username: 'Frank' }) as any;

      expect(result.props.children).toBe('Hello, Frank!');
      expect(result.props['data-i18n-key']).toBe('examples.template.helloUser');
    });
  });

  describe('其他方法调用', () => {
    it('应该正确调用 setLang 方法', () => {
      const proxy = createKiwiProxy(mockI18n);
      proxy.setLang?.('en-US');

      expect(mockI18n.setLang).toHaveBeenCalledWith('en-US');
    });

    it('应该正确调用 get 方法', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.get?.('test.key');

      expect(mockI18n.get).toHaveBeenCalledWith('test.key');
      expect(result).toBe('value_test.key');
    });

    it('应该绑定方法的 this 上下文', () => {
      const proxy = createKiwiProxy(mockI18n);
      const setLang = proxy.setLang;

      // 即使解构后调用，this 仍然正确
      setLang?.('zh-CN');
      expect(mockI18n.setLang).toHaveBeenCalledWith('zh-CN');
    });
  });

  describe('配置选项', () => {
    it('应该支持 debug: false 选项', () => {
      const proxy = createKiwiProxy(mockI18n, { debug: false });
      const result = proxy.common.hello;

      // debug 为 false 时应该返回原始对象
      expect(typeof result).toBe('string');
      expect(result).toBe('Hello');
    });

    it('应该支持自定义 i18nIdentifier', () => {
      const proxy = createKiwiProxy(mockI18n, { i18nIdentifier: 'T' });
      const result = proxy.common.hello;

      // 功能应该正常工作
      expect(React.isValidElement(result)).toBe(true);
    });

    it('应该默认在开发环境启用 debug', () => {
      process.env.NODE_ENV = 'development';
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello;

      expect(React.isValidElement(result)).toBe(true);
    });

    it('应该在生产环境默认禁用 debug', () => {
      process.env.NODE_ENV = 'production';
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello;

      expect(typeof result).toBe('string');
    });
  });

  describe('边缘情况', () => {
    it('应该处理空字符串值', () => {
      const mockWithEmpty = {
        empty: '',
      };
      const proxy = createKiwiProxy(mockWithEmpty);
      const result = proxy.empty as any;

      expect(React.isValidElement(result)).toBe(true);
      expect(result.props.children).toBe('');
    });

    it('应该处理包含特殊字符的字符串', () => {
      const mockWithSpecial = {
        special: 'Hello & <World> "Test"',
      };
      const proxy = createKiwiProxy(mockWithSpecial);
      const result = proxy.special as any;

      expect(result.props.children).toBe('Hello & <World> "Test"');
    });

    it('应该处理深层嵌套对象', () => {
      const deepMock = {
        a: { b: { c: { d: { e: { f: 'deep' } } } } },
      };
      const proxy = createKiwiProxy(deepMock);
      const result = proxy.a.b.c.d.e.f as any;

      expect(React.isValidElement(result)).toBe(true);
      expect(result.props['data-i18n-key']).toBe('a.b.c.d.e.f');
    });

    it('应该处理 template 方法不存在的情况', () => {
      const mockWithoutTemplate = {
        text: 'Hello {name}',
      };
      const proxy = createKiwiProxy(mockWithoutTemplate);

      // template 方法应该不存在
      expect(proxy.template).toBeUndefined();
    });

    it('应该处理非对象值', () => {
      const mockWithPrimitives = {
        number: 123 as any,
        boolean: true as any,
        nullValue: null as any,
      };
      const proxy = createKiwiProxy(mockWithPrimitives);

      // 非字符串、非对象值应该直接返回
      expect(proxy.number).toBe(123);
      expect(proxy.boolean).toBe(true);
      expect(proxy.nullValue).toBe(null);
    });

    it('应该处理数组值', () => {
      const mockWithArray = {
        items: ['item1', 'item2', 'item3'] as any,
      };
      const proxy = createKiwiProxy(mockWithArray);

      // 数组应该直接返回
      expect(Array.isArray(proxy.items)).toBe(true);
      expect(proxy.items).toEqual(['item1', 'item2', 'item3']);
    });
  });

  describe('React 元素类型和结构', () => {
    it('应该创建 span 元素', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello as any;

      expect(result.type).toBe('span');
    });

    it('应该只包含 data-i18n-key 属性（不添加其他属性）', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello as any;

      const props = result.props;
      const propKeys = Object.keys(props).filter(key => key !== 'children');

      expect(propKeys).toEqual(['data-i18n-key']);
    });

    it('应该保持 span 元素的内联特性', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result = proxy.common.hello as any;

      // span 元素默认是 inline 的，不应该有 style 属性
      expect(result.props.style).toBeUndefined();
    });
  });

  describe('性能和缓存', () => {
    it('应该每次访问返回新的 Proxy 对象', () => {
      const proxy = createKiwiProxy(mockI18n);
      const result1 = proxy.common;
      const result2 = proxy.common;

      // 每次访问应该创建新的 Proxy
      expect(result1).not.toBe(result2);
    });

    it('应该能够多次访问同一个属性', () => {
      const proxy = createKiwiProxy(mockI18n);

      for (let i = 0; i < 100; i++) {
        const result = proxy.common.hello;
        expect(React.isValidElement(result)).toBe(true);
      }
    });
  });

  describe('类型安全和 TypeScript', () => {
    it('应该保持原始对象的类型结构', () => {
      const proxy = createKiwiProxy(mockI18n);

      // TypeScript 应该能够推断出类型
      expect(proxy.common).toBeDefined();
      expect(proxy.examples).toBeDefined();
      expect(proxy.nested).toBeDefined();
    });

    it('应该允许访问方法', () => {
      const proxy = createKiwiProxy(mockI18n);

      expect(typeof proxy.template).toBe('function');
      expect(typeof proxy.setLang).toBe('function');
      expect(typeof proxy.get).toBe('function');
    });
  });
});
