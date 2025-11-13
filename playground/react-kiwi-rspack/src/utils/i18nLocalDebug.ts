/**
 * I18N 本地调试工具
 * 用于在生产环境中模拟开发环境的调试功能
 */

import { readI18nValue, updateI18nValue } from './i18nStorage';

/**
 * 模拟 API 调用：读取翻译
 */
export async function mockReadI18n(key: string): Promise<{
  success: boolean;
  key?: string;
  values?: Record<string, string>;
  error?: string;
}> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const values = readI18nValue(key);

    if (values) {
      return {
        success: true,
        key,
        values,
      };
    }

    // 如果 localStorage 中没有，返回空值（UI 组件会显示当前值）
    return {
      success: false,
      error: 'Not found in localStorage, showing current values',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 模拟 API 调用：更新翻译
 */
export async function mockUpdateI18n(
  key: string,
  values: Record<string, string>
): Promise<{
  success: boolean;
  results?: Array<{ locale: string; success: boolean }>;
  error?: string;
}> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 150));

  try {
    const success = updateI18nValue(key, values);

    if (success) {
      return {
        success: true,
        results: Object.keys(values).map(locale => ({
          locale,
          success: true,
        })),
      };
    }

    return {
      success: false,
      error: 'Failed to update localStorage',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 模拟 API 调用：AI 翻译（占位实现）
 */
export async function mockTranslateText(
  text: string,
  candidateCount = 3
): Promise<{
  success: boolean;
  translations?: Array<{ text: string; style: string }>;
  error?: string;
}> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    // 简单的模拟翻译逻辑
    const mockTranslations = [
      { text: `${text} (Translation 1)`, style: 'formal' },
      { text: `${text} (Translation 2)`, style: 'casual' },
      { text: `${text} (Translation 3)`, style: 'friendly' },
    ].slice(0, candidateCount);

    return {
      success: true,
      translations: mockTranslations,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed',
    };
  }
}

/**
 * 健康检查
 */
export async function mockHealthCheck(): Promise<{
  status: string;
  message: string;
  storage: {
    type: string;
    available: boolean;
  };
}> {
  // 检查 localStorage 是否可用
  let storageAvailable = false;
  try {
    const test = '__i18nflow_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }

  return {
    status: 'ok',
    message: 'I18N Local Debug is running (localStorage mode)',
    storage: {
      type: 'localStorage',
      available: storageAvailable,
    },
  };
}
