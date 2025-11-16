import { useState } from 'react';
import LanguageSwitcher from './components/LanguageSwitcher';
import BasicExample from './components/BasicExample';
import AdvancedExample from './components/AdvancedExample';
import ApiExample from './components/ApiExample';
import FormExample from './components/FormExample';
import './styles/app.css';

/**
 * 主应用组件
 * 展示所有 react-i18next 的功能示例
 */
function App() {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'api' | 'form'>('basic');

  const tabStyle = (tab: typeof activeTab): React.CSSProperties => ({
    padding: '12px 24px',
    backgroundColor: activeTab === tab ? '#4CAF50' : '#e0e0e0',
    color: activeTab === tab ? 'white' : '#333',
    border: 'none',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* 语言切换器 */}
      <LanguageSwitcher />

      {/* 标签页导航 */}
      <div
        style={{
          display: 'flex',
          gap: '5px',
          marginBottom: '0',
          borderBottom: '2px solid #4CAF50',
        }}
      >
        <button style={tabStyle('basic')} onClick={() => setActiveTab('basic')}>
          基础用法 / Basic Usage
        </button>
        <button style={tabStyle('advanced')} onClick={() => setActiveTab('advanced')}>
          高级用法 / Advanced Usage
        </button>
        <button style={tabStyle('api')} onClick={() => setActiveTab('api')}>
          API 示例 / API Examples
        </button>
        <button style={tabStyle('form')} onClick={() => setActiveTab('form')}>
          表单示例 / Form Example
        </button>
      </div>

      {/* 内容区域 */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0 0 8px 8px',
          minHeight: '500px',
        }}
      >
        {activeTab === 'basic' && <BasicExample />}
        {activeTab === 'advanced' && <AdvancedExample />}
        {activeTab === 'api' && <ApiExample />}
        {activeTab === 'form' && <FormExample />}
      </div>

      {/* 页脚 */}
      <footer
        style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666',
        }}
      >
        <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
          🚀 React + Rspack + react-i18next 完整示例项目
        </p>
        <p style={{ margin: '0', fontSize: '12px' }}>
          本项目展示了 react-i18next 的所有主要功能和使用场景
        </p>
        <div
          style={{
            marginTop: '15px',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <a
            href="https://react.i18next.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2196F3', textDecoration: 'none', fontSize: '14px' }}
          >
            📚 react-i18next 文档
          </a>
          <a
            href="https://www.i18next.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2196F3', textDecoration: 'none', fontSize: '14px' }}
          >
            📖 i18next 文档
          </a>
          <a
            href="https://www.rspack.dev/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2196F3', textDecoration: 'none', fontSize: '14px' }}
          >
            ⚡ Rspack 官网
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
