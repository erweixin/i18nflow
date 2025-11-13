/**
 * Toast 消息提示组件
 */

import { createRoot } from 'react-dom/client';

import { injectGlobalStyles } from './styles';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  type?: ToastType;
}

const TOAST_ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

let toastContainer: HTMLDivElement | null = null;

function getToastContainer(): HTMLDivElement {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'i18nflow-toast-container';
    document.body.appendChild(toastContainer);
    injectGlobalStyles();
  }
  return toastContainer;
}

function showToast(message: string, options: ToastOptions = {}) {
  const { duration = 3000, type = 'info' } = options;
  const container = getToastContainer();

  const toastEl = document.createElement('div');
  container.appendChild(toastEl);

  const root = createRoot(toastEl);

  const ToastContent = () => (
    <div className={`i18nflow-toast i18nflow-toast-${type}`}>
      <span className="i18nflow-toast-icon">{TOAST_ICONS[type]}</span>
      <span className="i18nflow-toast-content">{message}</span>
    </div>
  );

  root.render(<ToastContent />);

  // 自动移除
  setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(-20px)';
    toastEl.style.transition = 'all 0.3s';

    setTimeout(() => {
      root.unmount();
      toastEl.remove();

      // 如果没有 toast 了，移除容器
      if (container.children.length === 0) {
        container.remove();
        toastContainer = null;
      }
    }, 300);
  }, duration);
}

export const message = {
  success: (text: string, duration?: number) => {
    showToast(text, { type: 'success', duration });
  },
  error: (text: string, duration?: number) => {
    showToast(text, { type: 'error', duration });
  },
  warning: (text: string, duration?: number) => {
    showToast(text, { type: 'warning', duration });
  },
  info: (text: string, duration?: number) => {
    showToast(text, { type: 'info', duration });
  },
};
