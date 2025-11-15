/**
 * Runtime Proxy 单元测试
 * 测试 wrapTFunction 和 createI18nReactElement 的功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { wrapTFunction } from '../proxy';
import * as React from 'react';

// Mock React.createElement
vi.mock('react', () => ({
  createElement: vi.fn((type, props, ...children) => ({
    type,
    props: { ...props, children },
    $$typeof: Symbol.for('react.element'),
  })),
  isValidElement: vi.fn(obj => obj && obj.$$typeof === Symbol.for('react.element')),
}));

describe('wrapTFunction - Runtime Proxy', () => {
  // 模拟原始 t 函数
  const createMockTFunction = () => {
    const mockT = vi.fn((key: string, options?: any) => {
      // 简单的模拟翻译逻辑
      if (key === 'name') return 'Name';
      if (key === 'title') return 'Title';
      if (key === 'users.name') return 'User Name';
      if (key === 'greeting') return options ? `Hello ${options.name}` : 'Hello';
      return key;
    });
    return mockT as any;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('开发环境', () => {
    beforeEach(() => {
      // 设置为开发环境
      process.env.NODE_ENV = 'development';
    });

    it('应该包装 t 函数并返回 React 元素', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common');

      const result = wrappedT('name');

      // 验证调用了原始 t 函数
      expect(originalT).toHaveBeenCalledWith('name', undefined);

      // 验证创建了 React 元素
      expect(React.createElement).toHaveBeenCalledWith(
        'span',
        { 'data-i18n-key': 'common:name' },
        'Name'
      );

      // 验证返回值是 Proxy 包装的对象
      expect(result).toBeDefined();
    });

    it('应该正确处理 namespace', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common');

      wrappedT('title');

      expect(React.createElement).toHaveBeenCalledWith(
        'span',
        { 'data-i18n-key': 'common:title' },
        'Title'
      );
    });

    it('应该正确处理 namespace 和 keyPrefix', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common:users');

      wrappedT('name');

      expect(React.createElement).toHaveBeenCalledWith(
        'span',
        { 'data-i18n-key': 'common:users.name' },
        'Name'
      );
    });

    it('应该正确处理嵌套的 key', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common:forms');

      wrappedT('user.profile.name');

      expect(React.createElement).toHaveBeenCalledWith(
        'span',
        { 'data-i18n-key': 'common:forms.user.profile.name' },
        'user.profile.name'
      );
    });

    it('应该处理已经包含 namespace 的 key', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common:users');

      wrappedT('another:specific.key');

      // 已经包含 namespace 的 key 应该保持不变
      expect(React.createElement).toHaveBeenCalledWith(
        'span',
        { 'data-i18n-key': 'another:specific.key' },
        'another:specific.key'
      );
    });

    it('应该处理没有 context 的情况', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT);

      wrappedT('name');

      expect(React.createElement).toHaveBeenCalledWith('span', { 'data-i18n-key': 'name' }, 'Name');
    });

    it('应该处理只有 namespace 没有 keyPrefix 的情况', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common');

      wrappedT('name');

      expect(React.createElement).toHaveBeenCalledWith(
        'span',
        { 'data-i18n-key': 'common:name' },
        'Name'
      );
    });

    it('应该处理 options 中的 ns 参数', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common:users');

      wrappedT('name', { ns: 'custom' });

      // options 中的 ns 应该覆盖 context 中的 namespace
      expect(React.createElement).toHaveBeenCalledWith(
        'span',
        { 'data-i18n-key': 'custom:users.name' },
        'Name'
      );
    });

    it('应该处理非字符串返回值', () => {
      const originalT = vi.fn(() => ({ key: 'value' })) as any;
      const wrappedT = wrapTFunction(originalT, 'common');

      const result = wrappedT('name');

      // 非字符串返回值应该直接返回
      expect(result).toEqual({ key: 'value' });
      expect(React.createElement).not.toHaveBeenCalled();
    });

    it('返回的 Proxy 对象应该支持 toString', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common');

      const result = wrappedT('name') as any;

      // 验证 toString 方法
      expect(result.toString()).toBe('Name');
    });

    it('返回的 Proxy 对象应该支持 valueOf', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common');

      const result = wrappedT('name') as any;

      // 验证 valueOf 方法
      expect(result.valueOf()).toBe('Name');
    });

    it('返回的 Proxy 对象应该支持 Symbol.toPrimitive', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common');

      const result = wrappedT('name') as any;

      // 验证 Symbol.toPrimitive 方法
      expect(result[Symbol.toPrimitive]()).toBe('Name');
    });

    it('应该传递 options 给原始 t 函数', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common');

      const options = { name: 'John' };
      wrappedT('greeting', options);

      expect(originalT).toHaveBeenCalledWith('greeting', options);
    });
  });

  describe('生产环境', () => {
    beforeEach(() => {
      // 设置为生产环境
      process.env.NODE_ENV = 'production';
    });

    it('应该直接返回原始 t 函数', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common');

      // 在生产环境，应该返回原函数本身
      expect(wrappedT).toBe(originalT);
    });

    it('不应该创建 React 元素', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'common');

      wrappedT('name');

      // 生产环境不应该调用 React.createElement
      expect(React.createElement).not.toHaveBeenCalled();
    });
  });

  describe('边界情况', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('应该处理空字符串 key', () => {
      const originalT = vi.fn(() => '') as any;
      const wrappedT = wrapTFunction(originalT, 'common');

      wrappedT('');

      expect(React.createElement).toHaveBeenCalledWith('span', { 'data-i18n-key': 'common:' }, '');
    });

    it('应该处理 context 中只有冒号的情况', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, ':');

      wrappedT('name');

      expect(React.createElement).toHaveBeenCalledWith('span', { 'data-i18n-key': 'name' }, 'Name');
    });

    it('应该处理 context 中有多个冒号的情况', () => {
      const originalT = createMockTFunction();
      const wrappedT = wrapTFunction(originalT, 'ns:prefix:extra');

      wrappedT('name');

      // split(':') 会分隔所有冒号，所以 namespace='ns', keyPrefix='prefix'
      // 这种情况下建议用户避免在 context 中使用多个冒号
      expect(React.createElement).toHaveBeenCalledWith(
        'span',
        { 'data-i18n-key': 'ns:prefix.name' },
        'Name'
      );
    });
  });
});
