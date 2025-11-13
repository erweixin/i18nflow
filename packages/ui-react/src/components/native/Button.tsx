/**
 * Button 按钮组件
 */

import React from 'react';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'primary' | 'default';
  htmlType?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  type = 'default',
  htmlType = 'button',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const btnClass = `i18nflow-button i18nflow-button-${type} ${className}`;

  return (
    <button type={htmlType} className={btnClass} disabled={disabled || loading} {...props}>
      {loading && <span className="i18nflow-spinner" />}
      {!loading && icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
