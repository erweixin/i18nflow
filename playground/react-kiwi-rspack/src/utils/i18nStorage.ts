/**
 * I18N LocalStorage 管理工具
 * 在 Vercel 生产环境中模拟开发环境的 i18n 编辑功能
 */

const STORAGE_KEY = 'i18nflow_translations';
const STORAGE_VERSION = '1.0';

interface I18nStorageData {
  version: string;
  translations: Record<string, Record<string, string>>;
  timestamp: number;
}

interface I18nValues {
  [locale: string]: string;
}

/**
 * 初始化存储
 */
function initStorage(): I18nStorageData {
  return {
    version: STORAGE_VERSION,
    translations: {},
    timestamp: Date.now(),
  };
}

/**
 * 读取存储数据
 */
function getStorageData(): I18nStorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return initStorage();
    }

    const parsed = JSON.parse(data) as I18nStorageData;

    // 版本检查
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('⚠️ I18N storage version mismatch, resetting...');
      return initStorage();
    }

    return parsed;
  } catch (error) {
    console.error('❌ Failed to read I18N storage:', error);
    return initStorage();
  }
}

/**
 * 保存存储数据
 */
function setStorageData(data: I18nStorageData): boolean {
  try {
    data.timestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('✅ I18N storage saved:', data);
    return true;
  } catch (error) {
    console.error('❌ Failed to save I18N storage:', error);
    return false;
  }
}

/**
 * 读取指定 key 的翻译值
 */
export function readI18nValue(key: string): I18nValues | null {
  const data = getStorageData();
  const stored = data.translations[key];

  if (stored && Object.keys(stored).length > 0) {
    console.log(`📖 Read from localStorage: ${key}`, stored);
    return stored;
  }

  return null;
}

/**
 * 更新指定 key 的翻译值
 */
export function updateI18nValue(key: string, values: I18nValues): boolean {
  const data = getStorageData();

  // 合并新值
  data.translations[key] = {
    ...data.translations[key],
    ...values,
  };

  const success = setStorageData(data);

  if (success) {
    console.log(`📝 Updated localStorage: ${key}`, values);

    // 触发自定义事件，通知其他组件更新
    window.dispatchEvent(
      new CustomEvent('i18n-storage-update', {
        detail: { key, values },
      })
    );
  }

  return success;
}

/**
 * 删除指定 key 的翻译
 */
export function deleteI18nValue(key: string): boolean {
  const data = getStorageData();
  delete data.translations[key];
  return setStorageData(data);
}

/**
 * 清空所有自定义翻译
 */
export function clearAllI18nValues(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Cleared all I18N storage');

    // 触发清空事件
    window.dispatchEvent(new CustomEvent('i18n-storage-clear'));
    return true;
  } catch (error) {
    console.error('❌ Failed to clear I18N storage:', error);
    return false;
  }
}

/**
 * 获取所有自定义翻译
 */
export function getAllI18nValues(): Record<string, I18nValues> {
  const data = getStorageData();
  return data.translations;
}

/**
 * 导出翻译数据（用于备份）
 */
export function exportI18nData(): string {
  const data = getStorageData();
  return JSON.stringify(data, null, 2);
}

/**
 * 导入翻译数据（用于恢复）
 */
export function importI18nData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as I18nStorageData;

    if (!data.version || !data.translations) {
      throw new Error('Invalid data format');
    }

    return setStorageData(data);
  } catch (error) {
    console.error('❌ Failed to import I18N data:', error);
    return false;
  }
}

/**
 * 获取存储统计信息
 */
export function getStorageStats() {
  const data = getStorageData();
  const keys = Object.keys(data.translations);

  return {
    version: data.version,
    totalKeys: keys.length,
    timestamp: data.timestamp,
    lastModified: new Date(data.timestamp).toLocaleString(),
    keys,
  };
}
