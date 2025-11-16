import React, { useState, useEffect } from 'react';
import I18N from './locales/I18N';
import { LocaleType } from './locales/I18N';
import BasicExample from './components/BasicExample';
import TemplateExample from './components/TemplateExample';
import PluralExample from './components/PluralExample';
import FormExample from './components/FormExample';
import PropsExample from './components/PropsExample';
import './styles/app.css';

const LOCALE_STORAGE_KEY = 'i18nflow-locale';

// 从本地存储获取语言设置
const getStoredLocale = (): LocaleType => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'zh-CN' || stored === 'en-US') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read locale from localStorage:', error);
  }
  return 'zh-CN'; // 默认中文
};

// 保存语言设置到本地存储
const saveLocale = (locale: LocaleType) => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    console.warn('Failed to save locale to localStorage:', error);
  }
};

const App: React.FC = () => {
  const [locale, setLocale] = useState<LocaleType>(getStoredLocale);
  const [renderKey, setRenderKey] = useState(0);

  // 初始化语言设置
  useEffect(() => {
    const initialLocale = getStoredLocale();
    setLocale(initialLocale);
    I18N.setLang?.(initialLocale);
    // 触发重渲染以应用语言设置
    setRenderKey(prev => prev + 1);
  }, []);

  // 切换语言
  const toggleLanguage = () => {
    const newLocale: LocaleType = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLocale(newLocale);
    I18N.setLang?.(newLocale);
    saveLocale(newLocale);
    // 触发重渲染以应用语言变更
    setRenderKey(prev => prev + 1);
  };

  return (
    <>
      <div className="app-container" key={renderKey}>
        <header className="app-header">
          <h1>{I18N.app.title}</h1>
          <p>{I18N.app.description}</p>
          <button className="btn-primary" onClick={toggleLanguage}>
            {I18N.button.switchLanguage} ({locale})
          </button>
        </header>

        <main className="app-main">
          <section className="welcome-section">
            <h2>{I18N.features.title}</h2>
            <p>
              {/* 使用 template 方法进行变量插值 */}
              {I18N.template?.(I18N.welcome.greeting, { name: '张三' })}
            </p>
            <p>{I18N.welcome.message}</p>
            <div>
              {I18N.template?.(I18N.welcome.todayIs, {
                date: new Date().toLocaleDateString(locale),
              })}
            </div>
          </section>

          {/* 1. 基础用法示例 */}
          <BasicExample />

          {/* 2. 模板插值示例 - 展示 template API */}
          <TemplateExample />

          {/* 3. 复数处理示例 */}
          <PluralExample />

          {/* 4. Props 传递示例 - 复杂场景 */}
          <PropsExample />

          {/* 5. 表单示例 - 综合应用 */}
          <FormExample />
        </main>

        <footer className="app-footer">
          <p>
            {I18N.footer.poweredBy}{' '}
            <a href="https://github.com/alibaba/kiwi" target="_blank" rel="noopener noreferrer">
              Kiwi-Intl
            </a>
            {I18N.footer.and}
            <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">
              Vite
            </a>
            {I18N.footer.and}
            <a
              href="https://github.com/erweixin/i18nflow"
              target="_blank"
              rel="noopener noreferrer"
            >
              @i18nflow/kiwi
            </a>
          </p>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
            {I18N.footer.devModeTip}
          </p>
        </footer>
      </div>
    </>
  );
};

export default App;
