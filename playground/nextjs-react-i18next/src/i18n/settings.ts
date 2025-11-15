export const fallbackLng = 'zh-CN';
export const languages = ['zh-CN', 'en-US'];
export const defaultNS = 'common';

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    interpolation: {
      escapeValue: false, // React 已经处理了 XSS 防护，不需要转义
    },
  };
}
