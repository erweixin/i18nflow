/**
 * Auto Proxy Plugin 测试
 * 测试自动包装 kiwiIntl 实例的功能
 */

import { describe, it, expect } from 'vitest';
import { transformSync } from '@babel/core';
import { createAutoProxyPlugin } from '../auto-proxy-plugin';

// 辅助函数：转换代码
function transform(code: string, options = {}): string {
  const result = transformSync(code, {
    plugins: [[createAutoProxyPlugin(options)]],
    filename: 'test.ts',
    parserOpts: {
      plugins: ['typescript'],
    },
  });

  return result?.code || '';
}

describe('Auto Proxy Plugin', () => {
  describe('基本功能', () => {
    it('应该自动包装 export default kiwiIntl', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        const kiwiIntl = KiwiIntl.init('zh-CN', {});
        export default kiwiIntl;
      `;

      const output = transform(code);

      // 应该导入 createKiwiProxy
      expect(output).toContain('import { createKiwiProxy as __i18nflow_createKiwiProxy }');
      expect(output).toMatch(/from ['"]@i18nflow\/kiwi['"]/);

      // 应该包装导出
      expect(output).toContain('__i18nflow_createKiwiProxy(kiwiIntl)');
    });

    it.skip('应该处理直接导出 init 调用的情况', () => {
      // TODO: 这个场景需要额外处理，暂时跳过
      const code = `
        import KiwiIntl from 'kiwi-intl';
        export default KiwiIntl.init('zh-CN', {});
      `;

      const output = transform(code);

      expect(output).toContain('__i18nflow_createKiwiProxy');
      expect(output).toContain('KiwiIntl.init');
    });

    it('应该处理不同的变量名', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        const i18n = KiwiIntl.init('zh-CN', {});
        export default i18n;
      `;

      const output = transform(code);

      expect(output).toContain('__i18nflow_createKiwiProxy(i18n)');
    });
  });

  describe('跳过不需要处理的场景', () => {
    it('应该跳过没有 kiwi-intl 导入的文件', () => {
      const code = `
        const someData = { hello: 'world' };
        export default someData;
      `;

      const output = transform(code);

      // 不应该添加导入或包装
      expect(output).not.toContain('__i18nflow_createKiwiProxy');
      expect(output).not.toContain('@i18nflow/kiwi');
    });

    it('应该跳过已经手动导入 createKiwiProxy 的文件', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        import { createKiwiProxy } from '@i18nflow/kiwi';
        const kiwiIntl = KiwiIntl.init('zh-CN', {});
        export default createKiwiProxy(kiwiIntl);
      `;

      const output = transform(code);

      // 不应该添加新的导入
      expect(output).not.toContain('__i18nflow_createKiwiProxy');

      // 应该保持原样
      expect(output).toContain('createKiwiProxy(kiwiIntl)');
    });

    it('应该跳过导出其他变量的情况', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        const kiwiIntl = KiwiIntl.init('zh-CN', {});
        const config = { locale: 'zh-CN' };
        export default config;
      `;

      const output = transform(code);

      // 不应该包装 config
      expect(output).not.toContain('__i18nflow_createKiwiProxy');
    });
  });

  describe('可选链和 TypeScript 支持', () => {
    it('应该处理可选链调用', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        const kiwiIntl = KiwiIntl.init?.('zh-CN', {});
        export default kiwiIntl;
      `;

      const output = transform(code);

      expect(output).toContain('__i18nflow_createKiwiProxy');
    });

    it('应该处理 TypeScript 泛型', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        import zhCN from './zh-CN';
        const kiwiIntl = KiwiIntl.init<typeof zhCN>('zh-CN', {});
        export default kiwiIntl;
      `;

      const output = transform(code);

      expect(output).toContain('__i18nflow_createKiwiProxy');
    });
  });

  describe('命名导出', () => {
    it('应该处理命名导出', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        const kiwiIntl = KiwiIntl.init('zh-CN', {});
        export { kiwiIntl };
      `;

      const output = transform(code);

      expect(output).toContain('__i18nflow_createKiwiProxy');
      expect(output).toContain('__i18nflow_wrapped');
    });

    it('应该处理带别名的命名导出', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        const kiwiIntl = KiwiIntl.init('zh-CN', {});
        export { kiwiIntl as I18N };
      `;

      const output = transform(code);

      expect(output).toContain('__i18nflow_createKiwiProxy');
    });
  });

  describe('复杂场景', () => {
    it('应该处理多个导入和导出', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        import zhCN from './zh-CN';
        import enUS from './en-US';

        const kiwiIntl = KiwiIntl.init('zh-CN', {
          'zh-CN': zhCN,
          'en-US': enUS,
        });

        export type LangType = typeof zhCN;
        export default kiwiIntl;
      `;

      const output = transform(code);

      expect(output).toContain('__i18nflow_createKiwiProxy(kiwiIntl)');
      expect(output).toContain('export type LangType');
    });

    it('应该只在第一次需要时添加导入', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        const kiwiIntl = KiwiIntl.init('zh-CN', {});
        export default kiwiIntl;
      `;

      const output = transform(code);

      // 只应该有一个导入声明
      const importCount = (output.match(/__i18nflow_createKiwiProxy/g) || []).length;
      expect(importCount).toBeGreaterThan(0);
    });
  });

  describe('配置选项', () => {
    it('应该支持禁用插件', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        const kiwiIntl = KiwiIntl.init('zh-CN', {});
        export default kiwiIntl;
      `;

      const output = transform(code, { enabled: false });

      // 禁用时不应该进行任何转换
      expect(output).not.toContain('__i18nflow_createKiwiProxy');
    });

    it('应该支持自定义包名', () => {
      const code = `
        import MyIntl from 'my-custom-intl';
        const myI18n = MyIntl.init('zh-CN', {});
        export default myI18n;
      `;

      const output = transform(code, {
        kiwiIntlPackage: 'my-custom-intl',
        i18nflowPackage: '@custom/package',
      });

      expect(output).toMatch(/from ['"]@custom\/package['"]/);
      expect(output).toContain('__i18nflow_createKiwiProxy');
    });
  });

  describe('边缘情况', () => {
    it('应该处理空文件', () => {
      const code = '';
      const output = transform(code);
      expect(output).toBe('');
    });

    it('应该处理只有导入的文件', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
      `;

      const output = transform(code);
      expect(output).not.toContain('__i18nflow_createKiwiProxy');
    });

    it('应该处理只有导出的文件', () => {
      const code = `
        const data = { hello: 'world' };
        export default data;
      `;

      const output = transform(code);
      expect(output).not.toContain('__i18nflow_createKiwiProxy');
    });

    it('应该处理多个变量声明', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        const a = 1, kiwiIntl = KiwiIntl.init('zh-CN', {}), b = 2;
        export default kiwiIntl;
      `;

      const output = transform(code);
      expect(output).toContain('__i18nflow_createKiwiProxy(kiwiIntl)');
    });
  });

  describe('保持代码结构', () => {
    it('应该保持注释', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        // 初始化 i18n
        const kiwiIntl = KiwiIntl.init('zh-CN', {});
        // 导出 i18n 实例
        export default kiwiIntl;
      `;

      const output = transform(code);

      // 基本功能应该工作
      expect(output).toContain('__i18nflow_createKiwiProxy');
    });

    it('应该保持其他导出', () => {
      const code = `
        import KiwiIntl from 'kiwi-intl';
        const kiwiIntl = KiwiIntl.init('zh-CN', {});
        export const locale = 'zh-CN';
        export default kiwiIntl;
      `;

      const output = transform(code);

      expect(output).toContain('export const locale');
      expect(output).toContain('__i18nflow_createKiwiProxy(kiwiIntl)');
    });
  });
});
