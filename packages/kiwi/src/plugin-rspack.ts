/**
 * @i18nflow/kiwi - Rspack Plugin
 * 服务端专用，包含完整的插件功能
 */

// Plugin（仅服务端使用）
export { KiwiRspackPlugin } from './plugin/rspack';
export type { KiwiRspackPluginOptions } from './plugin/rspack';

// 也导出其他服务端功能，供高级用户使用
export { createKiwiBabelPlugin } from './transform';
export { createKiwiMiddleware } from './server';
export type { KiwiMiddlewareConfig } from './server';
export { KiwiTypeScriptFileAdapter } from './file';
