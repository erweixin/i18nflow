import KiwiIntl from 'kiwi-intl';
import zhCN from './zh-CN';
import enUS from './en-US';

// 初始化 Kiwi-Intl 实例
// 注意：不需要手动调用 createKiwiProxy！
// KiwiVitePlugin 会自动在编译时包装这个导出
const kiwiIntl = KiwiIntl.init<typeof zhCN>(
  'zh-CN', // 默认语言
  {
    'zh-CN': zhCN,
    'en-US': enUS,
  }
);

export default kiwiIntl;

// 导出类型，方便 TypeScript 类型推导
export type LangType = typeof zhCN;
export type LocaleType = 'zh-CN' | 'en-US';
