/**
 * I18N 本地调试 Hook
 * 使用 localStorage 而不是 API 调用
 */

import { useState, useCallback, useEffect } from 'react';
import { mockUpdateI18n, mockTranslateText } from '../utils/i18nLocalDebug';
import { readI18nValue } from '../utils/i18nStorage';
import I18N from '../locales/I18N';

interface I18nValues {
  'zh-CN': string;
  'en-US': string;
  [key: string]: string;
}

interface TranslationCandidate {
  text: string;
  style: string;
}

interface UseI18nLocalDebugReturn {
  loading: boolean;
  error: string | null;
  translating: boolean;
  readI18nValue: (key: string) => Promise<I18nValues | null>;
  updateI18nValue: (key: string, values: I18nValues) => Promise<boolean>;
  translateText: (text: string, candidateCount?: number) => Promise<TranslationCandidate[] | null>;
}

/**
 * 从 key 路径获取当前运行时的值
 * 例如: "app.title" => I18N.app.title
 */
function getValueFromI18N(key: string): Record<string, string> {
  const parts = key.split('.');
  let current: any = I18N;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return {};
    }
  }

  // 如果找到了值，返回当前语言的值
  // 注意：这里我们需要获取所有语言的值，但 kiwi-intl 运行时只有当前语言
  // 所以我们返回当前值作为所有语言的默认值
  if (typeof current === 'string') {
    return {
      'zh-CN': current,
      'en-US': current,
    };
  }

  return {};
}

/**
 * 使用 I18N 本地调试功能
 */
export function useI18nLocalDebug(): UseI18nLocalDebugReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  /**
   * 监听存储变化，自动刷新页面
   */
  useEffect(() => {
    const handleStorageUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 I18N storage updated:', customEvent.detail);

      // 延迟刷新，让用户看到保存成功的提示
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    window.addEventListener('i18n-storage-update', handleStorageUpdate);

    return () => {
      window.removeEventListener('i18n-storage-update', handleStorageUpdate);
    };
  }, []);

  /**
   * 读取指定 key 的翻译内容
   */
  const readI18nValueFn = useCallback(async (key: string): Promise<I18nValues | null> => {
    setLoading(true);
    setError(null);

    try {
      // 首先尝试从 localStorage 读取
      const storedValue = readI18nValue(key);

      if (storedValue && Object.keys(storedValue).length > 0) {
        console.log('✅ Found in localStorage:', storedValue);
        return storedValue as I18nValues;
      }

      // 如果 localStorage 中没有，获取运行时的当前值
      const currentValues = getValueFromI18N(key);

      if (Object.keys(currentValues).length > 0) {
        console.log('📖 Using current runtime values:', currentValues);
        return currentValues as I18nValues;
      }

      // 如果都没有，返回空值
      setError('未找到该翻译 key');
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '读取失败';
      setError(errorMessage);
      console.error('❌ Read I18N failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新指定 key 的翻译内容
   */
  const updateI18nValueFn = useCallback(
    async (key: string, values: I18nValues): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await mockUpdateI18n(key, values);

        if (response.success) {
          console.log('✅ I18N updated in localStorage:', key);
          return true;
        }

        setError(response.error || '更新失败');
        return false;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '更新失败';
        setError(errorMessage);
        console.error('❌ Update I18N failed:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * AI 翻译文本（模拟实现）
   */
  const translateTextFn = useCallback(
    async (text: string, candidateCount = 3): Promise<TranslationCandidate[] | null> => {
      setTranslating(true);
      setError(null);

      try {
        const response = await mockTranslateText(text, candidateCount);

        if (response.success && response.translations) {
          console.log('✅ AI translation (mocked):', response.translations);
          return response.translations;
        }

        setError(response.error || '翻译失败');
        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '翻译失败';
        setError(errorMessage);
        console.error('❌ AI translation failed:', err);
        return null;
      } finally {
        setTranslating(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    translating,
    readI18nValue: readI18nValueFn,
    updateI18nValue: updateI18nValueFn,
    translateText: translateTextFn,
  };
}
