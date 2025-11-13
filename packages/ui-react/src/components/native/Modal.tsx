/**
 * Modal 弹窗组件
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { injectGlobalStyles } from './styles';

interface ModalProps {
  open: boolean;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  width?: number | string;
  centered?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  footer,
  onClose,
  width = 600,
}) => {
  useEffect(() => {
    injectGlobalStyles();
  }, []);

  useEffect(() => {
    if (!open) return;

    // 按 ESC 关闭
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // 防止背景滚动
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);

  const handleOverlayClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleContentClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!open) return null;

  return createPortal(
    <div className="i18nflow-modal-overlay" onClick={handleOverlayClick}>
      <div className="i18nflow-modal" style={{ width }} onClick={handleContentClick}>
        {title && (
          <div className="i18nflow-modal-header">
            <h3 className="i18nflow-modal-title">{title}</h3>
            <button className="i18nflow-modal-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        )}

        <div className="i18nflow-modal-body">{children}</div>

        {footer && <div className="i18nflow-modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
