/**
 * 原生UI组件样式
 * 现代、美观的CSS-in-JS样式
 */

// 注入全局样式
export function injectGlobalStyles() {
  const styleId = 'i18nflow-ui-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* I18nFlow UI 全局样式 */
    .i18nflow-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: i18nflow-fade-in 0.2s ease-out;
      backdrop-filter: blur(4px);
    }

    .i18nflow-modal {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
      animation: i18nflow-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }

    .i18nflow-modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .i18nflow-modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #262626;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .i18nflow-modal-close {
      background: transparent;
      border: none;
      font-size: 20px;
      color: #8c8c8c;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
      line-height: 1;
    }

    .i18nflow-modal-close:hover {
      background: #f5f5f5;
      color: #262626;
    }

    .i18nflow-modal-body {
      padding: 24px;
    }

    .i18nflow-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .i18nflow-button {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      line-height: 1.5;
      outline: none;
    }

    .i18nflow-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .i18nflow-button-primary {
      background: #1890ff;
      color: #ffffff;
      border-color: #1890ff;
    }

    .i18nflow-button-primary:hover:not(:disabled) {
      background: #40a9ff;
      border-color: #40a9ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
    }

    .i18nflow-button-primary:active:not(:disabled) {
      background: #096dd9;
      border-color: #096dd9;
    }

    .i18nflow-button-default {
      background: #ffffff;
      color: #262626;
      border-color: #d9d9d9;
    }

    .i18nflow-button-default:hover:not(:disabled) {
      color: #1890ff;
      border-color: #1890ff;
    }

    .i18nflow-button-default:active:not(:disabled) {
      color: #096dd9;
      border-color: #096dd9;
    }

    .i18nflow-form-item {
      margin-bottom: 20px;
    }

    .i18nflow-form-label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #262626;
    }

    .i18nflow-input,
    .i18nflow-textarea {
      width: 100%;
      padding: 8px 12px;
      font-size: 14px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      outline: none;
      transition: all 0.2s;
      font-family: inherit;
      color: #262626;
      background: #ffffff;
    }

    .i18nflow-input:hover,
    .i18nflow-textarea:hover {
      border-color: #40a9ff;
    }

    .i18nflow-input:focus,
    .i18nflow-textarea:focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    .i18nflow-textarea {
      min-height: 80px;
      resize: vertical;
    }

    .i18nflow-alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 14px;
      line-height: 1.5;
    }

    .i18nflow-alert-error {
      background: #fff2f0;
      border: 1px solid #ffccc7;
      color: #cf1322;
    }

    .i18nflow-alert-warning {
      background: #fffbe6;
      border: 1px solid #ffe58f;
      color: #d46b08;
    }

    .i18nflow-alert-info {
      background: #e6f7ff;
      border: 1px solid #91d5ff;
      color: #0958d9;
    }

    .i18nflow-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(24, 144, 255, 0.2);
      border-top-color: #1890ff;
      border-radius: 50%;
      animation: i18nflow-spin 0.8s linear infinite;
    }

    .i18nflow-spinner-large {
      width: 32px;
      height: 32px;
      border-width: 3px;
    }

    .i18nflow-spin-container {
      position: relative;
      min-height: 100px;
    }

    .i18nflow-spin-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .i18nflow-tag {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      font-size: 12px;
      border-radius: 4px;
      background: #f0f0f0;
      color: #595959;
      border: 1px solid #d9d9d9;
      gap: 6px;
    }

    .i18nflow-tag-clickable {
      cursor: pointer;
      transition: all 0.2s;
    }

    .i18nflow-tag-clickable:hover {
      background: #1890ff;
      color: #ffffff;
      border-color: #1890ff;
    }

    .i18nflow-space {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .i18nflow-space-vertical {
      flex-direction: column;
    }

    .i18nflow-text-secondary {
      color: #8c8c8c;
      font-size: 12px;
    }

    .i18nflow-toast-container {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2000;
      pointer-events: none;
    }

    .i18nflow-toast {
      background: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      animation: i18nflow-slide-down 0.3s ease-out;
      pointer-events: auto;
      min-width: 300px;
    }

    .i18nflow-toast-success {
      border-left: 4px solid #52c41a;
    }

    .i18nflow-toast-error {
      border-left: 4px solid #ff4d4f;
    }

    .i18nflow-toast-warning {
      border-left: 4px solid #faad14;
    }

    .i18nflow-toast-info {
      border-left: 4px solid #1890ff;
    }

    .i18nflow-toast-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .i18nflow-toast-success .i18nflow-toast-icon {
      color: #52c41a;
    }

    .i18nflow-toast-error .i18nflow-toast-icon {
      color: #ff4d4f;
    }

    .i18nflow-toast-warning .i18nflow-toast-icon {
      color: #faad14;
    }

    .i18nflow-toast-info .i18nflow-toast-icon {
      color: #1890ff;
    }

    .i18nflow-toast-content {
      font-size: 14px;
      color: #262626;
      flex: 1;
    }

    @keyframes i18nflow-fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes i18nflow-scale-in {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes i18nflow-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes i18nflow-slide-down {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* 响应式 */
    @media (max-width: 768px) {
      .i18nflow-modal {
        max-width: 95vw;
        border-radius: 8px;
      }

      .i18nflow-modal-header,
      .i18nflow-modal-body,
      .i18nflow-modal-footer {
        padding: 16px;
      }

      .i18nflow-toast {
        min-width: auto;
        max-width: 90vw;
      }
    }
  `;

  document.head.appendChild(style);
}
