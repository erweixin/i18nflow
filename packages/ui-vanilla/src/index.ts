/**
 * @i18nflow/ui-vanilla
 * Framework-agnostic debugging UI
 */

export { I18nDebugUI } from './I18nDebugUI';
export type { I18nDebugUIOptions } from './I18nDebugUI';

/**
 * 创建并初始化调试 UI（便捷方法）
 */
export function initI18nDebugUI(options?: { enabled?: boolean; apiBase?: string }) {
  if (typeof window === 'undefined') {
    console.warn('I18nDebugUI can only be initialized in browser environment');
    return null;
  }

  const { I18nDebugUI } = require('./I18nDebugUI');
  return new I18nDebugUI(options);
}
