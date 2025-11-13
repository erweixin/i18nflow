/**
 * @i18nflow/kiwi
 * Complete Kiwi-Intl solution for i18nflow
 *
 * 默认导出：客户端功能（Runtime Proxy + UI 组件）
 * 如需使用 Rspack Plugin，请从 '@i18nflow/kiwi/plugin-rspack' 导入
 */

// 客户端功能（默认导出）
export { createKiwiProxy, __i18nflow_createProxy } from './runtime';
export { I18nDebugProvider, I18nEditModal, useI18nDebug } from '@i18nflow/ui-react';
