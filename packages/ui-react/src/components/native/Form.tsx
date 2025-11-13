/**
 * Form 表单组件
 */

import React, { useState } from 'react';

interface FormInstance<T = any> {
  getFieldValue: (name: keyof T) => any;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldsValue: (values: Partial<T>) => void;
  getFieldsValue: () => T;
  resetFields: () => void;
  validateFields: () => Promise<T>;
}

interface FormProps {
  children: React.ReactNode;
  onFinish?: (values: any) => void;
  initialValues?: any;
}

interface FormItemProps {
  label?: React.ReactNode;
  name?: string;
  children: React.ReactNode;
  required?: boolean;
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

export function useForm<T = any>(): [FormInstance<T>] {
  const [values, setValues] = useState<any>({});

  const form: FormInstance<T> = React.useMemo(
    () => ({
      getFieldValue: name => values[name],
      setFieldValue: (name, value) => {
        setValues((prev: any) => {
          // 避免不必要的状态更新
          if (prev[name] === value) return prev;
          return { ...prev, [name]: value };
        });
      },
      setFieldsValue: newValues => {
        setValues((prev: any) => {
          // 检查是否有实际变化
          const hasChanges = Object.keys(newValues).some(
            key => prev[key] !== (newValues as any)[key]
          );
          if (!hasChanges) return prev;
          return { ...prev, ...newValues };
        });
      },
      getFieldsValue: () => values,
      resetFields: () => {
        setValues({});
      },
      validateFields: async () => {
        return values;
      },
    }),
    [values]
  );

  return [form];
}

export const Form: React.FC<FormProps> = ({ children, onFinish }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFinish) {
      const formData = new FormData(e.target as HTMLFormElement);
      const values: any = {};
      formData.forEach((value, key) => {
        values[key] = value;
      });
      onFinish(values);
    }
  };

  return <form onSubmit={handleSubmit}>{children}</form>;
};

export const FormItem: React.FC<FormItemProps> = ({ label, name, children, required }) => {
  return (
    <div className="i18nflow-form-item">
      {label && (
        <label className="i18nflow-form-label" htmlFor={name}>
          {required && <span style={{ color: '#ff4d4f' }}>* </span>}
          {label}
        </label>
      )}
      {children}
    </div>
  );
};

export const Input: React.FC<InputProps> = props => {
  return <input className="i18nflow-input" {...props} />;
};

export const TextArea: React.FC<TextAreaProps> = ({ rows = 4, ...props }) => {
  return <textarea className="i18nflow-textarea" rows={rows} {...props} />;
};
