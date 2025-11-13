import React, { useState } from 'react';
import { I18nDebugProvider } from '@i18nflow/kiwi';
import I18N from './locales/I18N';
import { LocaleType } from './locales/I18N';
import BasicExample from './components/BasicExample';
import TemplateExample from './components/TemplateExample';
import PluralExample from './components/PluralExample';
import FormExample from './components/FormExample';
import PropsExample from './components/PropsExample';
import './styles/app.css';

const App: React.FC = () => {
  const [locale, setLocale] = useState<LocaleType>('zh-CN');

  // 切换语言
  const toggleLanguage = () => {
    const newLocale: LocaleType = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLocale(newLocale);
    I18N.setLang?.(newLocale);
  };

  return (
    <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'}>
      <div className="app-container">
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
            Powered by{' '}
            <a href="https://github.com/alibaba/kiwi" target="_blank" rel="noopener noreferrer">
              Kiwi-Intl
            </a>
            {' & '}
            <a href="https://www.rspack.dev/" target="_blank" rel="noopener noreferrer">
              Rspack
            </a>
            {' & '}
            <a
              href="https://github.com/erweixin/i18nflow"
              target="_blank"
              rel="noopener noreferrer"
            >
              @i18nflow/kiwi
            </a>
          </p>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
            💡 开发模式：按住 Ctrl+Shift (Mac: Cmd+Shift) 点击文案即可编辑
          </p>
        </footer>
      </div>
    </I18nDebugProvider>
  );
};

export default App;
