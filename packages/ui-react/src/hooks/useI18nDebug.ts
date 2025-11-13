/**
 * I18N 调试 Hook
 * 提供读取和更新翻译的功能
 */

import { useState, useCallback } from 'react';

interface I18nValues {
  'zh-CN': string;
  'en-US': string;
  [key: string]: string;
}

interface TranslationCandidate {
  text: string;
  style: string;
}

interface UseI18nDebugReturn {
  loading: boolean;
  error: string | null;
  translating: boolean;
  readI18nValue: (key: string) => Promise<I18nValues | null>;
  updateI18nValue: (key: string, values: I18nValues) => Promise<boolean>;
  translateText: (text: string, candidateCount?: number) => Promise<TranslationCandidate[] | null>;
}

/**
 * 使用 I18N 调试功能
 */
export function useI18nDebug(): UseI18nDebugReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  /**
   * 读取指定 key 的翻译内容
   */
  const readI18nValue = useCallback(async (key: string): Promise<I18nValues | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/i18n/read?key=${encodeURIComponent(key)}`);
      const data = (await response.json()) as {
        success?: boolean;
        values?: I18nValues;
        error?: string;
      };

      if (data.success && data.values) {
        return data.values;
      }

      setError(data.error || '读取失败');
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '网络错误';
      setError(errorMessage);
      console.error('读取 I18N 失败:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新指定 key 的翻译内容
   */
  const updateI18nValue = useCallback(async (key: string, values: I18nValues): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/i18n/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, values }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (data.success) {
        console.log('✅ I18N 更新成功:', key);
        return true;
      }

      setError(data.error || '更新失败');
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '网络错误';
      setError(errorMessage);
      console.error('更新 I18N 失败:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * AI 翻译文本
   */
  const translateText = useCallback(
    async (text: string, candidateCount = 3): Promise<TranslationCandidate[] | null> => {
      setTranslating(true);
      setError(null);

      try {
        const response = await fetch('/api/i18n/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, candidateCount }),
        });

        const data = (await response.json()) as {
          success?: boolean;
          translations?: TranslationCandidate[];
          error?: string;
        };

        if (data.success && data.translations) {
          console.log('✅ AI 翻译成功:', data.translations);
          return data.translations;
        }

        setError(data.error || '翻译失败');
        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '网络错误';
        setError(errorMessage);
        console.error('AI 翻译失败:', err);
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
    readI18nValue,
    updateI18nValue,
    translateText,
  };
}
