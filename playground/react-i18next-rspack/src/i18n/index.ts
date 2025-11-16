import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enUS from './locales/en-US';
import zhCN from './locales/zh-CN';

i18n
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 传递 i18n 实例给 react-i18next
  .init({
    resources: {
      'en-US': enUS,
      'zh-CN': zhCN,
    },
    fallbackLng: 'zh-CN',
    debug: false,
    interpolation: {
      escapeValue: false, // React 已经默认转义了
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
