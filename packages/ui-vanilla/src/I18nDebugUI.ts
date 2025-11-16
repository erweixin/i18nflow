/**
 * I18nDebugUI - Framework-agnostic debugging UI
 * 使用原生 JavaScript 实现，不依赖任何框架
 */

import { createStyles } from './styles';
import { createModal } from './modal';

export interface I18nDebugUIOptions {
  /** 是否启用调试 UI */
  enabled?: boolean;
  /** API 基础路径 */
  apiBase?: string;
}

export class I18nDebugUI {
  private enabled: boolean;
  private apiBase: string;
  private isKeyPressed: boolean = false;
  private tipElement: HTMLElement | null = null;
  private styleElement: HTMLElement | null = null;

  constructor(options: I18nDebugUIOptions = {}) {
    this.enabled = options.enabled ?? true;
    this.apiBase = options.apiBase ?? '/api/i18n';

    if (this.enabled && typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // 注入样式
    this.injectStyles();

    // 注册事件监听
    this.registerEventListeners();

    // 显示启用提示
    this.showInitTip();
  }

  private injectStyles() {
    if (document.getElementById('i18nflow-debug-styles')) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'i18nflow-debug-styles';
    this.styleElement.textContent = createStyles();
    document.head.appendChild(this.styleElement);
  }

  private registerEventListeners() {
    // 监听键盘事件
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // 监听点击事件（捕获阶段）
    document.addEventListener('click', this.handleClick, true);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl + Shift (Windows/Linux) 或 Cmd + Shift (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && !this.isKeyPressed) {
      this.isKeyPressed = true;
      document.body.style.cursor = 'crosshair';
      this.showTip();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && this.isKeyPressed) {
      this.isKeyPressed = false;
      document.body.style.cursor = '';
      this.hideTip();
    }
  };

  private handleClick = (e: MouseEvent) => {
    if (!this.enabled || !this.isKeyPressed) return;

    e.preventDefault();
    e.stopPropagation();

    // 查找最近的带有 data-i18n-key 属性的元素
    let target = e.target as HTMLElement;
    let i18nKey: string | null = null;
    // let clickedElement: HTMLElement | null = null;

    // 向上遍历 DOM 树查找 data-i18n-key
    while (target && target !== document.body) {
      const key =
        target.getAttribute('data-i18n-key') || target.getAttribute('data-i18n-placeholder');
      if (key) {
        i18nKey = key;
        // clickedElement = target;
        // 添加视觉反馈
        target.style.outline = '2px solid #1890ff';
        setTimeout(() => {
          if (target) target.style.outline = '';
        }, 300);
        break;
      }
      target = target.parentElement as HTMLElement;
    }

    if (i18nKey) {
      console.log('📝 编辑 I18N Key:', i18nKey);

      // 处理多个 key 的情况（用 | 分隔）
      if (i18nKey.includes('|')) {
        const keys = i18nKey.split('|').map(k => k.trim());
        console.log('🔍 发现多个 key，使用第一个:', keys[0]);
        i18nKey = keys[0];
      }

      // 显示编辑 Modal
      this.showEditModal(i18nKey);
    } else {
      console.warn('⚠️ 未找到 data-i18n-key 属性');
    }
  };

  private showTip() {
    if (this.tipElement) return;

    this.tipElement = document.createElement('div');
    this.tipElement.className = 'i18nflow-debug-tip';
    this.tipElement.textContent = '🌍 I18N 调试模式：点击文案进行编辑';
    document.body.appendChild(this.tipElement);
  }

  private hideTip() {
    if (this.tipElement) {
      this.tipElement.remove();
      this.tipElement = null;
    }
  }

  private showInitTip() {
    setTimeout(() => {
      console.log(
        '%c🌍 I18N Debug Mode Enabled',
        'background: #1890ff; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      );
      console.log('💡 使用方式: 按住 Ctrl/Cmd + Shift，然后点击文案即可编辑');
    }, 1000);
  }

  private async showEditModal(i18nKey: string) {
    // 读取翻译内容
    const values = await this.readI18nValue(i18nKey);

    // 创建并显示 Modal
    const modal = createModal({
      i18nKey,
      initialValues: values || {},
      onSave: async (newValues: Record<string, string>) => {
        const success = await this.updateI18nValue(i18nKey, newValues);
        if (success) {
          // 刷新页面
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        return success;
      },
    });

    document.body.appendChild(modal);
  }

  private async readI18nValue(key: string): Promise<Record<string, string> | null> {
    try {
      const response = await fetch(`${this.apiBase}/read?key=${encodeURIComponent(key)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.values || null;
    } catch (error) {
      console.error('❌ 读取翻译失败:', error);
      return null;
    }
  }

  private async updateI18nValue(key: string, values: Record<string, string>): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, values }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      console.log('✅ 翻译更新成功');
      return true;
    } catch (error) {
      console.error('❌ 更新翻译失败:', error);
      return false;
    }
  }

  /**
   * 销毁实例，清理事件监听和 DOM 元素
   */
  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('click', this.handleClick, true);

    if (this.tipElement) {
      this.tipElement.remove();
      this.tipElement = null;
    }

    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }
}
