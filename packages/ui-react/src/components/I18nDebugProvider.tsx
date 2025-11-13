/* eslint-disable */
/**
 * I18N 调试 Provider
 * 监听点击事件，展示编辑 Modal
 */
import React, { useState, useEffect, useCallback } from 'react';

import { I18nEditModal } from './I18nEditModal';

interface I18nDebugProviderProps {
  enabled?: boolean;
  children: React.ReactNode;
}

/**
 * I18N 调试提供者组件
 * 在开发环境下按住 Ctrl/Cmd + Shift 点击文案时，调起编辑 Modal
 */
export const I18nDebugProvider: React.FC<I18nDebugProviderProps> = ({
  enabled = true,
  children,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [isKeyPressed, setIsKeyPressed] = useState(false);

  /**
   * 监听键盘事件
   */
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift (Windows/Linux) 或 Cmd + Shift (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        setIsKeyPressed(true);
        // 添加视觉提示
        document.body.style.cursor = 'crosshair';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        setIsKeyPressed(false);
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.body.style.cursor = '';
    };
  }, [enabled]);

  /**
   * 从 key 获取当前 DOM 上的文本内容
   */
  const getCurrentTextFromDOM = useCallback(
    (element: HTMLElement): string =>
      // 尝试获取元素的文本内容
      element.textContent?.trim() || element.innerText?.trim() || '',
    []
  );

  /**
   * 监听点击事件
   */
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!enabled || !isKeyPressed) return;

      e.preventDefault();
      e.stopPropagation();

      // 查找最近的带有 data-i18n-key 属性的元素
      let target = e.target as HTMLElement;
      let i18nKey: string | null = null;
      let clickedElement: HTMLElement | null = null;

      // 向上遍历 DOM 树查找 data-i18n-key
      while (target && target !== document.body) {
        const key = target.getAttribute('data-i18n-key');
        if (key) {
          i18nKey = key;
          clickedElement = target;
          // 添加视觉反馈
          target.style.outline = '2px solid #1890ff';
          setTimeout(() => {
            target.style.outline = '';
          }, 300);
          break;
        }
        target = target.parentElement as HTMLElement;
      }

      if (i18nKey) {
        console.log('📝 编辑 I18N Key (原始):', i18nKey);

        // 获取当前显示的文本（作为备用）
        let currentText = '';
        if (clickedElement) {
          currentText = getCurrentTextFromDOM(clickedElement);
          console.log('📄 当前文本:', currentText);
        }

        // 如果 key 包含多个选项（用 | 分隔），尝试通过文本匹配找到正确的 key
        if (i18nKey.includes('|')) {
          const keys = i18nKey.split('|').map(k => k.trim());

          console.log('🔍 发现多个 key，尝试匹配:', keys);

          // 尝试通过当前文本匹配正确的 key
          for (const key of keys) {
            const parts = key.split('.');
            if (parts.length >= 2) {
              // 尝试从 I18N 对象获取对应的值
              try {
                let value = (window as any).I18N as any;
                for (const part of parts) {
                  value = value?.[part];
                }
                if (typeof value === 'string' && value === currentText) {
                  console.log('✅ 通过文本匹配到 key:', key);
                  i18nKey = key;
                  break;
                }
              } catch (e) {
                // 忽略错误，继续尝试下一个 key
              }
            }
          }

          // 如果没有匹配到，使用第一个 key
          if (i18nKey.includes('|')) {
            console.log('⚠️ 无法精确匹配，使用第一个 key');
            i18nKey = keys[0];
          }
        }

        console.log('✅ 最终使用的 key:', i18nKey);

        setCurrentKey(i18nKey);
        setModalVisible(true);
      } else {
        console.warn('⚠️  未找到 data-i18n-key 属性');
      }
    },
    [enabled, isKeyPressed, getCurrentTextFromDOM]
  );

  /**
   * 注册全局点击监听
   */
  useEffect(() => {
    if (!enabled) return;

    // 使用捕获阶段来确保能拦截所有点击
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [enabled, handleClick]);

  /**
   * 显示调试提示
   */
  useEffect(() => {
    if (!enabled) return;

    const showTip = () => {
      console.log(
        '%c🌍 I18N Debug Mode Enabled',
        'background: #1890ff; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      );
      console.log('💡 使用方式: 按住 Ctrl/Cmd + Shift，然后点击文案即可编辑');
    };

    // 延迟显示，确保在其他日志之后
    setTimeout(showTip, 1000);
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* 调试提示浮层 */}
      {isKeyPressed && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            padding: '8px 16px',
            background: 'rgba(24, 144, 255, 0.9)',
            color: 'white',
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 'bold',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }}
        >
          🌍 I18N 调试模式：点击文案进行编辑
        </div>
      )}

      {/* 编辑 Modal */}
      <I18nEditModal
        visible={modalVisible}
        i18nKey={currentKey}
        onClose={() => {
          setModalVisible(false);
          setCurrentKey(null);
        }}
      />
    </>
  );
};
