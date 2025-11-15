'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/client';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio: string;
  country: string;
  age: string;
  interests: string[];
  newsletter: boolean;
  terms: boolean;
}

export default function FormExample({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, 'form');
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    country: '',
    age: '',
    interests: [],
    newsletter: false,
    terms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // 验证用户名
    if (!formData.username) {
      newErrors.username = t('requiredField');
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = t('usernameHint', { min: 3, max: 20 });
    }

    // 验证邮箱
    if (!formData.email) {
      newErrors.email = t('requiredField');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('emailError');
    }

    // 验证密码
    if (!formData.password) {
      newErrors.password = t('requiredField');
    } else if (formData.password.length < 8) {
      newErrors.password = t('passwordPlaceholder', { length: 8 });
    }

    // 验证确认密码
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch');
    }

    // 验证年龄
    if (formData.age && (parseInt(formData.age) < 18 || parseInt(formData.age) > 100)) {
      newErrors.age = t('ageRange', { min: 18, max: 100 });
    }

    // 验证条款
    if (!formData.terms) {
      newErrors.terms = t('requiredField');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitMessage(t('errorMessage'));
      return;
    }

    setIsSubmitting(true);

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitMessage(t('successMessage', { username: formData.username }));

    // 3秒后清除消息
    setTimeout(() => setSubmitMessage(''), 3000);
  };

  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      country: '',
      age: '',
      interests: [],
      newsletter: false,
      terms: false,
    });
    setErrors({});
    setSubmitMessage('');
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>{t('title')}</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* 用户名 */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            {t('username')} *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            placeholder={t('usernamePlaceholder')}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${errors.username ? 'red' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          {errors.username && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
              {errors.username}
            </div>
          )}
          <div style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
            {t('usernameHint', { min: 3, max: 20 })}
          </div>
        </div>

        {/* 邮箱 */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            {t('email')} *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder={t('emailPlaceholder')}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${errors.email ? 'red' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          {errors.email && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.email}</div>
          )}
        </div>

        {/* 密码 */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            {t('password')} *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            placeholder={t('passwordPlaceholder', { length: 8 })}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${errors.password ? 'red' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          {errors.password && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
              {errors.password}
            </div>
          )}
        </div>

        {/* 确认密码 */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            {t('confirmPassword')} *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder={t('confirmPasswordPlaceholder')}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${errors.confirmPassword ? 'red' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          {errors.confirmPassword && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
              {errors.confirmPassword}
            </div>
          )}
        </div>

        {/* 个人简介 */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            {t('bio')}
          </label>
          <textarea
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            placeholder={t('bioPlaceholder')}
            rows={4}
            maxLength={500}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
          <div style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
            {t('bioCount', { count: formData.bio.length, max: 500 })}
          </div>
        </div>

        {/* 国家/地区 */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            {t('country')}
          </label>
          <select
            value={formData.country}
            onChange={e => setFormData({ ...formData, country: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="">{t('countryPlaceholder')}</option>
            <option value="cn">{t('countryOptions.cn')}</option>
            <option value="us">{t('countryOptions.us')}</option>
            <option value="uk">{t('countryOptions.uk')}</option>
            <option value="jp">{t('countryOptions.jp')}</option>
          </select>
        </div>

        {/* 年龄 */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            {t('age')}
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            placeholder={t('agePlaceholder')}
            min="18"
            max="100"
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${errors.age ? 'red' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          {errors.age && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.age}</div>
          )}
        </div>

        {/* 兴趣爱好 */}
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            {t('interests')}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['coding', 'reading', 'sports', 'music', 'travel'].map(interest => (
              <label
                key={interest}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestToggle(interest)}
                  style={{ marginRight: '5px' }}
                />
                {t(`interestOptions.${interest}`)}
              </label>
            ))}
          </div>
        </div>

        {/* 订阅新闻 */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.newsletter}
              onChange={e => setFormData({ ...formData, newsletter: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            {t('newsletter')}
          </label>
        </div>

        {/* 服务条款 */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.terms}
              onChange={e => setFormData({ ...formData, terms: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            {t('terms')} *
          </label>
          {errors.terms && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.terms}</div>
          )}
        </div>

        {/* 提交按钮 */}
        <div style={{ display: 'flex', gap: '10px' }}>
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
              fontSize: '16px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {t('reset')}
          </button>
        </div>

        {/* 提交消息 */}
        {submitMessage && (
          <div
            style={{
              padding: '12px',
              backgroundColor:
                submitMessage.includes('成功') || submitMessage.includes('success')
                  ? '#d4edda'
                  : '#f8d7da',
              color:
                submitMessage.includes('成功') || submitMessage.includes('success')
                  ? '#155724'
                  : '#721c24',
              border: `1px solid ${submitMessage.includes('成功') || submitMessage.includes('success') ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px',
            }}
          >
            {submitMessage}
          </div>
        )}
      </form>
    </div>
  );
}
