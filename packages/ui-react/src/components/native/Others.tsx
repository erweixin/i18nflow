/**
 * 其他辅助组件
 */

import React from 'react';

// Alert 组件
interface AlertProps {
  type?: 'error' | 'warning' | 'info';
  message: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', message, description, action }) => {
  return (
    <div className={`i18nflow-alert i18nflow-alert-${type}`}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{message}</div>
        {description && <div style={{ marginTop: 4, opacity: 0.85 }}>{description}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// Spin 组件
interface SpinProps {
  spinning?: boolean;
  children?: React.ReactNode;
  tip?: string;
  size?: 'default' | 'large';
}

export const Spin: React.FC<SpinProps> = ({ spinning = true, children, tip, size = 'default' }) => {
  if (!children) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div
          className={`i18nflow-spinner ${size === 'large' ? 'i18nflow-spinner-large' : ''}`}
          style={{ margin: '0 auto' }}
        />
        {tip && <div style={{ marginTop: 8, color: '#8c8c8c' }}>{tip}</div>}
      </div>
    );
  }

  if (!spinning) {
    return <>{children}</>;
  }

  return (
    <div className="i18nflow-spin-container">
      {children}
      <div className="i18nflow-spin-overlay">
        <div>
          <div
            className={`i18nflow-spinner ${size === 'large' ? 'i18nflow-spinner-large' : ''}`}
            style={{ margin: '0 auto' }}
          />
          {tip && <div style={{ marginTop: 8, color: '#8c8c8c' }}>{tip}</div>}
        </div>
      </div>
    </div>
  );
};

// Space 组件
interface SpaceProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  size?: number;
  style?: React.CSSProperties;
}

export const Space: React.FC<SpaceProps> = ({
  children,
  direction = 'horizontal',
  size,
  style,
}) => {
  const className = `i18nflow-space ${direction === 'vertical' ? 'i18nflow-space-vertical' : ''}`;
  const spaceStyle: React.CSSProperties = {
    ...style,
    ...(size !== undefined && { gap: `${size}px` }),
  };

  return (
    <div className={className} style={spaceStyle}>
      {children}
    </div>
  );
};

// Tag 组件
interface TagProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({ children, onClick, icon }) => {
  const className = `i18nflow-tag ${onClick ? 'i18nflow-tag-clickable' : ''}`;

  return (
    <span className={className} onClick={onClick}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

// Typography
export const Typography = {
  Text: ({
    children,
    type,
    style,
  }: {
    children: React.ReactNode;
    type?: 'secondary';
    style?: React.CSSProperties;
  }) => (
    <span className={type === 'secondary' ? 'i18nflow-text-secondary' : ''} style={style}>
      {children}
    </span>
  ),
};

// Tooltip (简化版，使用 title 属性)
interface TooltipProps {
  title: string;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ title, children }) => {
  return React.cloneElement(children, {
    title,
  });
};
