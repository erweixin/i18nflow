/**
 * CSS 样式定义
 */

export function createStyles(): string {
  return `
/* 调试提示浮层 */
.i18nflow-debug-tip {
  position: fixed;
  top: 16px;
  right: 16px;
  padding: 8px 16px;
  background: rgba(24, 144, 255, 0.9);
  color: white;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  z-index: 99999;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  pointer-events: none;
  animation: i18nflow-fadeIn 0.2s ease-in;
}

/* Modal 遮罩层 */
.i18nflow-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100000;
  animation: i18nflow-fadeIn 0.3s ease-in;
}

/* Modal 容器 */
.i18nflow-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100001;
  max-width: 650px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: i18nflow-slideUp 0.3s ease-out;
}

/* Modal 头部 */
.i18nflow-modal-header {
  padding: 16px 24px;
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

.i18nflow-modal-key {
  font-size: 14px;
  color: #8c8c8c;
  font-weight: normal;
  margin-left: 8px;
}

.i18nflow-modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #8c8c8c;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.i18nflow-modal-close:hover {
  color: #262626;
}

/* Modal 内容 */
.i18nflow-modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* 表单 */
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

.i18nflow-form-label-required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}

.i18nflow-form-input,
.i18nflow-form-textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: border-color 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.i18nflow-form-textarea {
  resize: vertical;
  min-height: 80px;
}

.i18nflow-form-input:focus,
.i18nflow-form-textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* Alert */
.i18nflow-alert {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.i18nflow-alert-error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
}

.i18nflow-alert-info {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #0050b3;
}

/* Modal 底部 */
.i18nflow-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 按钮 */
.i18nflow-btn {
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: white;
  color: #262626;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.i18nflow-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.i18nflow-btn-primary {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.i18nflow-btn-primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
  color: white;
}

.i18nflow-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.i18nflow-btn-loading {
  opacity: 0.6;
  pointer-events: none;
}

.i18nflow-btn-loading::before {
  content: '⏳ ';
}

/* Spinner */
.i18nflow-spinner {
  text-align: center;
  padding: 40px;
  color: #8c8c8c;
}

.i18nflow-spinner-icon {
  font-size: 24px;
  animation: i18nflow-spin 1s linear infinite;
}

/* 动画 */
@keyframes i18nflow-fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes i18nflow-slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, -45%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
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
`;
}
