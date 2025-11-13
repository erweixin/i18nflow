/**
 * @i18nflow/kiwi - 客户端
 * 仅包含浏览器端需要的功能
 */

// Runtime Proxy（客户端使用）
export { createKiwiProxy, __i18nflow_createProxy } from './runtime';

// Re-export UI components from @i18nflow/ui-react
export { I18nDebugProvider, I18nEditModal, useI18nDebug } from '@i18nflow/ui-react';
