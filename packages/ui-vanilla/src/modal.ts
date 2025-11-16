/**
 * 创建编辑 Modal
 */

export interface ModalOptions {
  i18nKey: string;
  initialValues: Record<string, string>;
  onSave: (values: Record<string, string>) => Promise<boolean>;
}

export function createModal(options: ModalOptions): HTMLElement {
  const { i18nKey, initialValues, onSave } = options;

  // 创建遮罩层
  const mask = document.createElement('div');
  mask.className = 'i18nflow-modal-mask';

  // 创建 Modal 容器
  const modal = document.createElement('div');
  modal.className = 'i18nflow-modal';

  // 当前表单值
  let currentValues = { ...initialValues };

  // 渲染 Modal
  modal.innerHTML = `
    <div class="i18nflow-modal-header">
      <h3 class="i18nflow-modal-title">
        🌍 编辑翻译
        <span class="i18nflow-modal-key">${escapeHtml(i18nKey)}</span>
      </h3>
      <button class="i18nflow-modal-close" aria-label="关闭">×</button>
    </div>
    <div class="i18nflow-modal-body">
      <div class="i18nflow-form">
        <div class="i18nflow-form-item">
          <label class="i18nflow-form-label i18nflow-form-label-required">中文翻译</label>
          <textarea
            class="i18nflow-form-textarea"
            data-field="zh-CN"
            placeholder="请输入中文翻译"
            rows="3"
          >${escapeHtml(initialValues['zh-CN'] || '')}</textarea>
        </div>
        <div class="i18nflow-form-item">
          <label class="i18nflow-form-label i18nflow-form-label-required">英文翻译</label>
          <textarea
            class="i18nflow-form-textarea"
            data-field="en-US"
            placeholder="请输入英文翻译"
            rows="3"
          >${escapeHtml(initialValues['en-US'] || '')}</textarea>
        </div>
      </div>
    </div>
    <div class="i18nflow-modal-footer">
      <button class="i18nflow-btn" data-action="reset">重置</button>
      <button class="i18nflow-btn" data-action="cancel">取消</button>
      <button class="i18nflow-btn i18nflow-btn-primary" data-action="save">保存并刷新</button>
    </div>
  `;

  // 关闭 Modal
  const closeModal = () => {
    mask.remove();
    modal.remove();
  };

  // 监听表单输入
  const textareas = modal.querySelectorAll('[data-field]') as NodeListOf<HTMLTextAreaElement>;
  textareas.forEach(textarea => {
    textarea.addEventListener('input', e => {
      const target = e.target as HTMLTextAreaElement;
      const field = target.getAttribute('data-field');
      if (field) {
        currentValues[field] = target.value;
      }
    });
  });

  // 关闭按钮
  const closeBtn = modal.querySelector('.i18nflow-modal-close');
  closeBtn?.addEventListener('click', closeModal);

  // 遮罩层点击
  mask.addEventListener('click', closeModal);

  // 阻止 Modal 内部点击冒泡
  modal.addEventListener('click', e => {
    e.stopPropagation();
  });

  // 按钮事件
  const resetBtn = modal.querySelector('[data-action="reset"]');
  const cancelBtn = modal.querySelector('[data-action="cancel"]');
  const saveBtn = modal.querySelector('[data-action="save"]');

  // 重置
  resetBtn?.addEventListener('click', () => {
    currentValues = { ...initialValues };
    textareas.forEach(textarea => {
      const field = textarea.getAttribute('data-field');
      if (field) {
        textarea.value = initialValues[field] || '';
      }
    });
    showMessage('已重置为初始值', 'info');
  });

  // 取消
  cancelBtn?.addEventListener('click', closeModal);

  // 保存
  saveBtn?.addEventListener('click', async () => {
    // 验证必填字段
    if (!currentValues['zh-CN'] || !currentValues['zh-CN'].trim()) {
      showMessage('请输入中文翻译', 'error');
      return;
    }
    if (!currentValues['en-US'] || !currentValues['en-US'].trim()) {
      showMessage('请输入英文翻译', 'error');
      return;
    }

    // 显示加载状态
    saveBtn.classList.add('i18nflow-btn-loading');
    saveBtn.setAttribute('disabled', 'true');

    try {
      const success = await onSave(currentValues);
      if (success) {
        showMessage('翻译已更新，页面将在 1 秒后刷新', 'success');
        setTimeout(closeModal, 800);
      } else {
        showMessage('更新失败，请查看控制台', 'error');
        saveBtn.classList.remove('i18nflow-btn-loading');
        saveBtn.removeAttribute('disabled');
      }
    } catch (error) {
      console.error('保存失败:', error);
      showMessage('保存失败，请查看控制台', 'error');
      saveBtn.classList.remove('i18nflow-btn-loading');
      saveBtn.removeAttribute('disabled');
    }
  });

  // ESC 键关闭
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // 添加到 body
  document.body.appendChild(mask);
  document.body.appendChild(modal);

  return modal;
}

/**
 * 显示消息提示
 */
function showMessage(message: string, type: 'success' | 'error' | 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    background: ${type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : '#1890ff'};
    color: white;
    border-radius: 4px;
    font-size: 14px;
    z-index: 100002;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    animation: i18nflow-fadeIn 0.3s ease-in;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/**
 * 转义 HTML
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
