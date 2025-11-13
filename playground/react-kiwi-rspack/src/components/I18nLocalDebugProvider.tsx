/**
 * I18N 本地调试 Provider
 * 使用 localStorage 替代 API 调用
 */

import React, { useState, useEffect, useCallback } from 'react';
import { I18nEditModalLocal } from './I18nEditModalLocal';

interface I18nLocalDebugProviderProps {
  enabled?: boolean;
  children: React.ReactNode;
}

/**
 * I18N 本地调试提供者组件
 * 在开发/生产环境下按住 Ctrl/Cmd + Shift 点击文案时，调起编辑 Modal
 * 数据存储在 localStorage 中
 */
export const I18nLocalDebugProvider: React.FC<I18nLocalDebugProviderProps> = ({
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
   * 监听点击事件
   */
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!enabled || !isKeyPressed) return;

      const target = e.target as HTMLElement;

      // 1. 查找最近的带有 data-i18n-key 的元素
      let element: HTMLElement | null = target;
      let i18nKey: string | null = null;

      while (element && element !== document.body) {
        i18nKey = element.getAttribute('data-i18n-key');
        if (i18nKey) break;
        element = element.parentElement;
      }

      if (!i18nKey) {
        console.warn('⚠️ 未找到 data-i18n-key 属性，请确保使用了 createKiwiProxy 包装');
        return;
      }

      // 2. 阻止默认行为和冒泡
      e.preventDefault();
      e.stopPropagation();

      console.log('🎯 Clicked I18N key:', i18nKey);

      // 3. 打开编辑 Modal
      setCurrentKey(i18nKey);
      setModalVisible(true);

      // 4. 移除键盘按下状态（避免再次点击）
      setIsKeyPressed(false);
      document.body.style.cursor = '';
    },
    [enabled, isKeyPressed]
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
        '%c🌍 I18N Local Debug Mode Enabled (localStorage)',
        'background: #52c41a; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      );
      console.log('💡 使用方式: 按住 Ctrl/Cmd + Shift，然后点击文案即可编辑');
      console.log('💾 存储方式: 修改将保存在浏览器 localStorage 中');
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
            background: 'rgba(82, 196, 26, 0.9)',
            color: 'white',
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 'bold',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }}
        >
          🌍 I18N 调试模式：点击文案进行编辑 (localStorage)
        </div>
      )}

      {/* 编辑 Modal */}
      <I18nEditModalLocal
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
