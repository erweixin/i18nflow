import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 表单示例组件
 * 展示在表单中使用 react-i18next 的各种场景
 */
export default function FormExample() {
  const { t } = useTranslation('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'china',
    city: '',
    address: '',
    gender: 'male',
    age: '',
    bio: '',
    interests: '',
    agreeTerms: false,
    subscribe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // 必填字段验证
    if (!formData.firstName) {
      newErrors.firstName = t('userForm.errors.required', { field: t('userForm.firstName') });
    }
    if (!formData.lastName) {
      newErrors.lastName = t('userForm.errors.required', { field: t('userForm.lastName') });
    }
    if (!formData.email) {
      newErrors.email = t('userForm.errors.required', { field: t('userForm.email') });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('userForm.errors.emailInvalid');
    }
    if (!formData.password) {
      newErrors.password = t('userForm.errors.required', { field: t('userForm.password') });
    } else if (formData.password.length < 6) {
      newErrors.password = t('userForm.errors.passwordTooShort');
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('userForm.errors.required', {
        field: t('userForm.confirmPassword'),
      });
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('userForm.errors.passwordNotMatch');
    }
    if (!formData.phone) {
      newErrors.phone = t('userForm.errors.required', { field: t('userForm.phone') });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // 模拟 API 请求
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      console.log('Form submitted:', formData);

      // 3秒后隐藏成功消息
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      country: 'china',
      city: '',
      address: '',
      gender: 'male',
      age: '',
      bio: '',
      interests: '',
      agreeTerms: false,
      subscribe: false,
    });
    setErrors({});
    setSubmitSuccess(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  const errorInputStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#f44336',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    color: '#333',
    fontWeight: '500',
    fontSize: '14px',
  };

  const errorStyle: React.CSSProperties = {
    color: '#f44336',
    fontSize: '12px',
    marginTop: '5px',
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>{t('title')}</h2>
      <p style={{ color: '#666', marginBottom: '25px' }}>{t('description')}</p>

      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '20px', textAlign: 'center' }}>
          {t('userForm.title')}
        </h3>

        {submitSuccess && (
          <div
            style={{
              padding: '15px',
              marginBottom: '20px',
              backgroundColor: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            ✅ {t('userForm.success')}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 名字和姓氏 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>{t('userForm.firstName')} *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t('userForm.placeholders.firstName')}
                style={errors.firstName ? errorInputStyle : inputStyle}
              />
              {errors.firstName && <div style={errorStyle}>{errors.firstName}</div>}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t('userForm.lastName')} *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t('userForm.placeholders.lastName')}
                style={errors.lastName ? errorInputStyle : inputStyle}
              />
              {errors.lastName && <div style={errorStyle}>{errors.lastName}</div>}
            </div>
          </div>

          {/* 邮箱 */}
          <div style={fieldStyle}>
            <label style={labelStyle}>{t('userForm.email')} *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('userForm.placeholders.email')}
              style={errors.email ? errorInputStyle : inputStyle}
            />
            {errors.email && <div style={errorStyle}>{errors.email}</div>}
          </div>

          {/* 密码 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>{t('userForm.password')} *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('userForm.placeholders.password')}
                style={errors.password ? errorInputStyle : inputStyle}
              />
              {errors.password && <div style={errorStyle}>{errors.password}</div>}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t('userForm.confirmPassword')} *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('userForm.placeholders.confirmPassword')}
                style={errors.confirmPassword ? errorInputStyle : inputStyle}
              />
              {errors.confirmPassword && <div style={errorStyle}>{errors.confirmPassword}</div>}
            </div>
          </div>

          {/* 电话 */}
          <div style={fieldStyle}>
            <label style={labelStyle}>{t('userForm.phone')} *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('userForm.placeholders.phone')}
              style={errors.phone ? errorInputStyle : inputStyle}
            />
            {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
          </div>

          {/* 国家和城市 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>{t('userForm.country')}</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="china">{t('countries.china')}</option>
                <option value="usa">{t('countries.usa')}</option>
                <option value="japan">{t('countries.japan')}</option>
                <option value="korea">{t('countries.korea')}</option>
                <option value="uk">{t('countries.uk')}</option>
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t('userForm.city')}</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder={t('userForm.placeholders.city')}
                style={inputStyle}
              />
            </div>
          </div>

          {/* 地址 */}
          <div style={fieldStyle}>
            <label style={labelStyle}>{t('userForm.address')}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={t('userForm.placeholders.address')}
              style={inputStyle}
            />
          </div>

          {/* 性别和年龄 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>{t('userForm.gender')}</label>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    style={{ marginRight: '5px' }}
                  />
                  {t('userForm.male')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    style={{ marginRight: '5px' }}
                  />
                  {t('userForm.female')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={handleChange}
                    style={{ marginRight: '5px' }}
                  />
                  {t('userForm.other')}
                </label>
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>{t('userForm.age')}</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="0"
                max="120"
                style={inputStyle}
              />
            </div>
          </div>

          {/* 个人简介 */}
          <div style={fieldStyle}>
            <label style={labelStyle}>{t('userForm.bio')}</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder={t('userForm.placeholders.bio')}
              rows={4}
              style={inputStyle}
            />
          </div>

          {/* 兴趣爱好 */}
          <div style={fieldStyle}>
            <label style={labelStyle}>{t('userForm.interests')}</label>
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder={t('userForm.placeholders.interests')}
              style={inputStyle}
            />
          </div>

          {/* 复选框 */}
          <div style={fieldStyle}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              {t('userForm.agreeTerms')}
            </label>
          </div>

          <div style={fieldStyle}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="subscribe"
                checked={formData.subscribe}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              {t('userForm.subscribe')}
            </label>
          </div>

          {/* 按钮 */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: isSubmitting ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {isSubmitting ? t('userForm.submitting') : t('userForm.submit')}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: isSubmitting ? '#ccc' : '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {t('userForm.reset')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
