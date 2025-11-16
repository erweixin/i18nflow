/**
 * Auto-inject I18nDebugUI
 * This module is automatically imported by the Rspack plugin when autoInjectDebugUI is enabled
 * @packageDocumentation
 */

/// <reference lib="dom" />

import { I18nDebugUI } from '@i18nflow/ui-vanilla';

// 等待 DOM ready 后初始化调试 UI
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDebugUI);
  } else {
    // DOM 已经 ready，直接初始化
    initDebugUI();
  }
}

function initDebugUI() {
  try {
    // 创建调试 UI 实例（框架无关）
    new I18nDebugUI({
      enabled: true,
      apiBase: '/api/i18n',
    });

    console.log('✨ I18nDebugUI auto-injected by @i18nflow/kiwi plugin');
  } catch (error) {
    console.error('❌ Failed to inject I18nDebugUI:', error);
  }
}
