import React, { useState } from 'react';
import I18N from '../locales/I18N';

interface FormData {
  username: string;
  password: string;
  email: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  email?: string;
}

/**
 * 表单示例
 * 展示在实际表单场景中使用 Kiwi-Intl 的综合应用
 */
const FormExample: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info' | null;
    message: string | undefined;
  }>({ type: null, message: '' });

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 验证用户名
    if (!formData.username) {
      newErrors.username = I18N.template?.(I18N.form.validation.required, {
        field: I18N.form.username,
      });
    } else if (formData.username.length < 3) {
      newErrors.username = I18N.template?.(I18N.form.validation.minLength, {
        field: I18N.form.username,
        min: 3,
      });
    } else if (formData.username.length > 20) {
      newErrors.username = I18N.template?.(I18N.form.validation.maxLength, {
        field: I18N.form.username,
        max: 20,
      });
    }

    // 验证密码
    if (!formData.password) {
      newErrors.password = I18N.template?.(I18N.form.validation.required, {
        field: I18N.form.password,
      });
    } else if (formData.password.length < 6) {
      newErrors.password = I18N.template?.(I18N.form.validation.minLength, {
        field: I18N.form.password,
        min: 6,
      });
    }

    // 验证邮箱
    if (!formData.email) {
      newErrors.email = I18N.template?.(I18N.form.validation.required, {
        field: I18N.form.email,
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = I18N.template?.(I18N.form.validation.invalid, {
        field: I18N.form.email,
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setNotification({
        type: 'success',
        message: I18N.notification.success,
      });
      // 清空表单
      setTimeout(() => {
        setFormData({ username: '', password: '', email: '' });
        setNotification({ type: null, message: '' });
      }, 2000);
    } else {
      setNotification({
        type: 'error',
        message: I18N.template?.(I18N.notification.error, {
          message: I18N.form.validation.invalid.replace('{field}', ''),
        }),
      });
    }
  };

  // 处理输入变化
  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
    // 清除该字段的错误
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  return (
    <section className="example-section">
      <h3>表单综合示例</h3>
      <div className="example-content">
        <div className="demo-box">
          <h4>用户注册表单</h4>

          {/* 通知消息 */}
          {notification.type && (
            <div className={`notification notification-${notification.type}`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="demo-form">
            {/* 用户名 */}
            <div className="form-field">
              <label htmlFor="username">{I18N.form.username}</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange('username')}
                placeholder={I18N.form.placeholder.username}
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            {/* 密码 */}
            <div className="form-field">
              <label htmlFor="password">{I18N.form.password}</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                placeholder={I18N.form.placeholder.password}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* 邮箱 */}
            <div className="form-field">
              <label htmlFor="email">{I18N.form.email}</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder={I18N.form.placeholder.email}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* 按钮 */}
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {I18N.button.submit}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFormData({ username: '', password: '', email: '' });
                  setErrors({});
                  setNotification({ type: null, message: '' });
                }}
              >
                {I18N.button.cancel}
              </button>
            </div>
          </form>

          {/* 代码示例 */}
          <div className="code-block">
            <code>
              {`// 表单验证中使用 I18N.template
const validateForm = () => {
  if (!username) {
    error = I18N.template?.(I18N.form.validation.required, {
      field: I18N.form.username
    });
  } else if (username.length < 3) {
    error = I18N.template?.(I18N.form.validation.minLength, {
      field: I18N.form.username,
      min: 3
    });
  }
  return error;
};`}
            </code>
          </div>
        </div>

        {/* API 说明 */}
        <div className="api-note">
          <h4>📘 表单国际化最佳实践</h4>
          <ul>
            <li>
              <strong>标签和占位符:</strong> 使用 I18N 对象直接访问文案
            </li>
            <li>
              <strong>验证消息:</strong> 使用 I18N.template 动态插入字段名和约束值
            </li>
            <li>
              <strong>通知消息:</strong> 根据类型选择对应的国际化文案
            </li>
            <li>
              <strong>按钮文本:</strong> 统一使用 button 命名空间下的文案
            </li>
          </ul>
          <p>这样可以确保整个表单的完全国际化，包括错误提示和用户反馈。</p>
        </div>
      </div>
    </section>
  );
};

export default FormExample;
