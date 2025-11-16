import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 基础用法示例组件
 * 展示 react-i18next 的基本功能：
 * 1. 简单翻译
 * 2. 插值（变量替换）
 * 3. 复数处理
 * 4. 嵌套翻译
 * 5. 上下文变体
 */
export default function BasicExample() {
  const { t, i18n } = useTranslation('basic');
  const [count, setCount] = useState(5);
  const [context, setContext] = useState<'male' | 'female' | undefined>('male');
  const [messageContext, setMessageContext] = useState<'read' | 'unread' | undefined>('unread');

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

      {/* 1. 简单翻译 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>{t('simpleTranslation.title')}</h3>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        >
          <p style={{ margin: '5px 0' }}>✅ {t('simpleTranslation.content')}</p>
          <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
            {t('simpleTranslation.example')}
          </p>
        </div>
        <pre
          style={{
            backgroundColor: '#2d2d2d',
            color: '#f8f8f2',
            padding: '15px',
            borderRadius: '4px',
            fontSize: '13px',
            overflow: 'auto',
          }}
        >
          {`const { t } = useTranslation('basic');
{t('simpleTranslation.content')}`}
        </pre>
      </section>

      {/* 2. 插值（变量替换） */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>{t('interpolation.title')}</h3>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        >
          <p style={{ margin: '5px 0' }}>
            👋 {t('interpolation.greeting', { name: '张三', place: '北京' })}
          </p>
          <p style={{ margin: '5px 0' }}>
            📧 {t('interpolation.userInfo', { username: '李四', email: 'lisi@example.com' })}
          </p>
          <p style={{ margin: '5px 0' }} suppressHydrationWarning>
            📅{' '}
            {t('interpolation.multipleVars', {
              date: new Date().toLocaleDateString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US'),
              time: new Date().toLocaleTimeString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US'),
              weather: i18n.language === 'zh-CN' ? '晴朗' : 'sunny',
            })}
          </p>
        </div>
        <pre
          style={{
            backgroundColor: '#2d2d2d',
            color: '#f8f8f2',
            padding: '15px',
            borderRadius: '4px',
            fontSize: '13px',
            overflow: 'auto',
          }}
        >
          {`{t('interpolation.greeting', { name: '张三', place: '北京' })}
{t('interpolation.userInfo', { username: '李四', email: 'lisi@example.com' })}`}
        </pre>
      </section>

      {/* 3. 复数处理 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>{t('pluralization.title')}</h3>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>计数: {count}</label>
            <button
              onClick={() => setCount(0)}
              style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
            >
              0
            </button>
            <button
              onClick={() => setCount(1)}
              style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
            >
              1
            </button>
            <button
              onClick={() => setCount(5)}
              style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
            >
              5
            </button>
            <button
              onClick={() => setCount(count + 1)}
              style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
            >
              +1
            </button>
            <button
              onClick={() => setCount(Math.max(0, count - 1))}
              style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
            >
              -1
            </button>
          </div>
          <p style={{ margin: '5px 0' }}>🍎 {t('pluralization.apple', { count })}</p>
          <p style={{ margin: '5px 0' }}>📦 {t('pluralization.item', { count })}</p>
          <p style={{ margin: '5px 0' }}>💬 {t('pluralization.message', { count })}</p>
        </div>
        <pre
          style={{
            backgroundColor: '#2d2d2d',
            color: '#f8f8f2',
            padding: '15px',
            borderRadius: '4px',
            fontSize: '13px',
            overflow: 'auto',
          }}
        >
          {`// 翻译文件
{
  "apple_zero": "没有苹果",
  "apple_one": "1 个苹果",
  "apple_other": "{{count}} 个苹果"
}

// 使用
{t('pluralization.apple', { count })}`}
        </pre>
      </section>

      {/* 4. 嵌套翻译 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>{t('nesting.title')}</h3>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        >
          <p style={{ margin: '5px 0' }}>🔗 基础: {t('nesting.welcome')}</p>
          <p style={{ margin: '5px 0' }}>🔗 嵌套: {t('nesting.fullMessage', { name: '王五' })}</p>
          <p style={{ margin: '5px 0' }}>🔗 页面标题: {t('nesting.pageTitle')}</p>
        </div>
        <pre
          style={{
            backgroundColor: '#2d2d2d',
            color: '#f8f8f2',
            padding: '15px',
            borderRadius: '4px',
            fontSize: '13px',
            overflow: 'auto',
          }}
        >
          {`// 翻译文件
{
  "welcome": "欢迎",
  "fullMessage": "$t(basic:nesting.welcome)回来，{{name}}！"
}

// 使用 $t() 引用另一个翻译
{t('nesting.fullMessage', { name: '王五' })}`}
        </pre>
      </section>

      {/* 5. 上下文变体 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>{t('context.title')}</h3>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>性别上下文:</label>
            <button
              onClick={() => setContext(undefined)}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: context === undefined ? '#4caf50' : '#e0e0e0',
                color: context === undefined ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              无上下文
            </button>
            <button
              onClick={() => setContext('male')}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: context === 'male' ? '#4caf50' : '#e0e0e0',
                color: context === 'male' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Male
            </button>
            <button
              onClick={() => setContext('female')}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: context === 'female' ? '#4caf50' : '#e0e0e0',
                color: context === 'female' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Female
            </button>
          </div>
          <p style={{ margin: '5px 0' }}>👥 {t('context.friend', { context })}</p>

          <div style={{ marginTop: '15px', marginBottom: '15px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>消息状态:</label>
            <button
              onClick={() => setMessageContext(undefined)}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: messageContext === undefined ? '#4caf50' : '#e0e0e0',
                color: messageContext === undefined ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              无状态
            </button>
            <button
              onClick={() => setMessageContext('read')}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: messageContext === 'read' ? '#4caf50' : '#e0e0e0',
                color: messageContext === 'read' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              已读
            </button>
            <button
              onClick={() => setMessageContext('unread')}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: messageContext === 'unread' ? '#4caf50' : '#e0e0e0',
                color: messageContext === 'unread' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              未读
            </button>
          </div>
          <p style={{ margin: '5px 0' }}>💌 {t('context.message', { context: messageContext })}</p>
        </div>
        <pre
          style={{
            backgroundColor: '#2d2d2d',
            color: '#f8f8f2',
            padding: '15px',
            borderRadius: '4px',
            fontSize: '13px',
            overflow: 'auto',
          }}
        >
          {`// 翻译文件
{
  "friend": "朋友",
  "friend_male": "男性朋友",
  "friend_female": "女性朋友"
}

// 使用
{t('context.friend', { context: 'male' })}`}
        </pre>
      </section>
    </div>
  );
}
