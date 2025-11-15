/**
 * @i18nflow/react-i18next
 * Complete react-i18next solution for i18nflow
 *
 * 默认导出：客户端功能（Runtime Proxy + UI 组件）
 * 如需使用 Next.js Plugin，请从 '@i18nflow/react-i18next/plugin-next' 导入
 * 如需使用 Vite Plugin，请从 '@i18nflow/react-i18next/plugin-vite' 导入
 */

// 客户端功能（默认导出）
export { wrapTFunction } from './runtime';
export { I18nDebugProvider, I18nEditModal, useI18nDebug } from '@i18nflow/ui-react';

// 导出类型
export type { ReactI18nextMiddlewareConfig } from './server';
