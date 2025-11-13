/**
 * I18N 调试面板
 * 显示 localStorage 中的翻译数据，提供管理功能
 */

import React, { useState, useEffect } from 'react';
import {
  getAllI18nValues,
  clearAllI18nValues,
  exportI18nData,
  importI18nData,
  getStorageStats,
} from '../utils/i18nStorage';

export const I18nDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof getStorageStats> | null>(null);
  const [translations, setTranslations] = useState<Record<string, any>>({});

  const loadData = () => {
    setStats(getStorageStats());
    setTranslations(getAllI18nValues());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleClear = () => {
    if (window.confirm('确定要清空所有自定义翻译吗？页面将会刷新。')) {
      clearAllI18nValues();
      window.location.reload();
    }
  };

  const handleExport = () => {
    const data = exportI18nData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `i18n-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          const content = event.target?.result as string;
          if (importI18nData(content)) {
            alert('导入成功！页面将会刷新。');
            window.location.reload();
          } else {
            alert('导入失败，请检查文件格式。');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 9998,
        }}
        title="打开 I18N 调试面板"
      >
        🌍
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 400,
        maxHeight: 600,
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        zIndex: 9998,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          background: '#1890ff',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 'bold' }}>🌍 I18N 调试面板</span>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: 20,
            cursor: 'pointer',
            padding: 0,
            width: 24,
            height: 24,
          }}
        >
          ×
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            <div>版本: {stats.version}</div>
            <div>自定义翻译数: {stats.totalKeys}</div>
            <div>最后修改: {stats.lastModified}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={loadData}
            style={{
              padding: '6px 12px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            🔄 刷新
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: '6px 12px',
              background: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            📥 导出
          </button>
          <button
            onClick={handleImport}
            style={{
              padding: '6px 12px',
              background: '#faad14',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            📤 导入
          </button>
          <button
            onClick={handleClear}
            style={{
              padding: '6px 12px',
              background: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            🗑️ 清空
          </button>
        </div>
      </div>

      {/* Translations List */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 16,
        }}
      >
        {Object.keys(translations).length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
            暂无自定义翻译
            <br />
            <small>按住 Ctrl/Cmd + Shift 点击文案进行编辑</small>
          </div>
        ) : (
          <div>
            {Object.entries(translations).map(([key, values]) => (
              <div
                key={key}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  background: '#f9f9f9',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#1890ff' }}>{key}</div>
                {Object.entries(values as Record<string, string>).map(([locale, value]) => (
                  <div key={locale} style={{ marginBottom: 4 }}>
                    <span style={{ color: '#666' }}>{locale}:</span>{' '}
                    <span style={{ color: '#333' }}>{value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
