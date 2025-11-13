/**
 * I18N 编辑 Modal（本地存储版本）
 * 展示和编辑翻译内容，使用 localStorage 而非 API
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useI18nLocalDebug } from '../hooks/useI18nLocalDebug';

interface I18nEditModalLocalProps {
  visible: boolean;
  i18nKey: string | null;
  onClose: () => void;
}

export const I18nEditModalLocal: React.FC<I18nEditModalLocalProps> = ({
  visible,
  i18nKey,
  onClose,
}) => {
  const { loading, readI18nValue, updateI18nValue } = useI18nLocalDebug();
  const [values, setValues] = useState<Record<string, string>>({
    'zh-CN': '',
    'en-US': '',
  });
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * 加载翻译值
   */
  const loadValues = useCallback(async () => {
    if (!i18nKey) return;

    setLoadError(null);
    const result = await readI18nValue(i18nKey);

    if (result) {
      setValues(result);
    } else {
      setLoadError('无法读取翻译内容');
    }
  }, [i18nKey, readI18nValue]);

  /**
   * 保存翻译
   */
  const handleSave = async () => {
    if (!i18nKey) return;

    setSaving(true);
    const success = await updateI18nValue(i18nKey, values);
    setSaving(false);

    if (success) {
      alert('保存成功！页面将会刷新。');
      // 刷新在 useI18nLocalDebug hook 中自动处理
    } else {
      alert('保存失败，请重试。');
    }
  };

  /**
   * 当 modal 打开时加载数据
   */
  useEffect(() => {
    if (visible && i18nKey) {
      loadValues();
    }
  }, [visible, i18nKey, loadValues]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 8,
          width: '90%',
          maxWidth: 600,
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: 16,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18 }}>
            🌍 编辑翻译
            <span style={{ fontSize: 12, color: '#52c41a', marginLeft: 8 }}>
              (localStorage 模式)
            </span>
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#999',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 16 }}>
          {/* Key */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              翻译 Key:
            </label>
            <div
              style={{
                padding: '8px 12px',
                background: '#f5f5f5',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: 14,
                color: '#1890ff',
              }}
            >
              {i18nKey}
            </div>
          </div>

          {/* Error */}
          {loadError && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: '#fff2e8',
                border: '1px solid #ffbb96',
                borderRadius: 4,
                color: '#fa541c',
              }}
            >
              ⚠️ {loadError}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>加载中...</div>
          )}

          {/* Form */}
          {!loading && (
            <>
              {Object.entries(values).map(([locale, value]) => (
                <div key={locale} style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 8,
                      fontWeight: 'bold',
                      color: '#333',
                    }}
                  >
                    {locale === 'zh-CN' ? '🇨🇳 中文' : '🇺🇸 English'}:
                  </label>
                  <textarea
                    value={value}
                    onChange={e =>
                      setValues(prev => ({
                        ...prev,
                        [locale]: e.target.value,
                      }))
                    }
                    style={{
                      width: '100%',
                      minHeight: 80,
                      padding: 8,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                    placeholder={`请输入 ${locale} 的翻译`}
                  />
                </div>
              ))}

              {/* Info */}
              <div
                style={{
                  padding: 12,
                  background: '#f0f9ff',
                  border: '1px solid #91d5ff',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#0958d9',
                  marginBottom: 16,
                }}
              >
                💡 提示：修改将保存在浏览器的 localStorage 中，仅在当前浏览器生效。
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 16,
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              background: 'white',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 4,
              background: saving ? '#d9d9d9' : '#52c41a',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}
          >
            {saving ? '保存中...' : '💾 保存'}
          </button>
        </div>
      </div>
    </div>
  );
};
