'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/client';
import { Trans, Translation } from 'react-i18next';

// ===== 示例组件 =====

// Badge 组件（用于 Trans）
function Badge({ children }: { children?: React.ReactNode }) {
  return (
    <span
      style={{
        padding: '2px 8px',
        backgroundColor: '#ff5722',
        color: 'white',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        marginLeft: '4px',
        marginRight: '4px',
      }}
    >
      {children}
    </span>
  );
}

// 价格组件（用于 Trans）
function Price({ children }: { children?: React.ReactNode }) {
  return (
    <span
      style={{
        fontWeight: 'bold',
        color: '#4caf50',
        fontSize: '18px',
      }}
    >
      {children}
    </span>
  );
}

// 折扣组件（用于 Trans）
function Discount({ children }: { children?: React.ReactNode }) {
  return (
    <span
      style={{
        color: '#ff5722',
        fontWeight: 'bold',
      }}
    >
      {children}
    </span>
  );
}

// Icon 组件
function Icon({ children }: { children?: React.ReactNode }) {
  return <span style={{ marginRight: '5px' }}>📚{children}</span>;
}

// ===== 主组件 =====
export default function ApiExample({ lng }: { lng: string }) {
  const { t, i18n, ready } = useTranslation(lng, 'api');
  const [count, setCount] = useState(5);
  const [context, setContext] = useState<'male' | 'female' | undefined>('male');
  const [messageStatus, setMessageStatus] = useState<'read' | 'unread' | undefined>('unread');

  if (!ready) {
    return <div>Loading translations...</div>;
  }

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

      {/* 1. useTranslation Hook */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>1. {t('useTranslation.title')}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          {t('useTranslation.description')}
        </p>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        >
          <p style={{ margin: '5px 0' }}>✅ {t('useTranslation.example')}</p>
          <p style={{ margin: '5px 0' }}>
            ✅ {t('useTranslation.withParams', { username: '张三', email: 'zhangsan@example.com' })}
          </p>
          <p style={{ margin: '5px 0' }}>
            ✅ {t('useTranslation.currentLang', { lng: i18n.language })}
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
          {`const { t, i18n, ready } = useTranslation(lng, 'api');
{t('useTranslation.example')}
{t('useTranslation.withParams', { username, email })}`}
        </pre>
      </section>

      {/* 2. Trans 组件 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>2. {t('trans.title')}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          {t('trans.description')}
        </p>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          {/* 简单 HTML */}
          <p style={{ margin: '10px 0' }}>
            📝{' '}
            <Trans i18nKey="trans.simpleHtml" t={t}>
              This is <strong>bold text</strong> and <em>italic text</em>
            </Trans>
          </p>

          {/* 带链接 */}
          <p style={{ margin: '10px 0' }}>
            🔗{' '}
            <Trans
              i18nKey="trans.withLink"
              t={t}
              components={{
                link: <a href="#" style={{ color: '#2196F3', textDecoration: 'underline' }} />,
              }}
            >
              Visit our <link>official website</link> for more information
            </Trans>
          </p>

          {/* 带按钮 */}
          <p style={{ margin: '10px 0' }}>
            🔘{' '}
            <Trans
              i18nKey="trans.withComponent"
              t={t}
              components={{
                button: (
                  <button
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      margin: '0 4px',
                    }}
                    onClick={() => alert('Clicked!')}
                  />
                ),
              }}
            >
              Click <button>here</button> for details
            </Trans>
          </p>

          {/* 复杂嵌套 */}
          <p style={{ margin: '10px 0' }}>
            💬{' '}
            <Trans
              i18nKey="trans.complexNesting"
              t={t}
              values={{ username: '李四', count: 3 }}
              components={{
                strong: <strong style={{ color: '#4caf50' }} />,
                badge: <Badge />,
              }}
            >
              {/* @ts-expect-error ？？？？？ */}
              Welcome <strong>{'{{username}}'}</strong>, you have <badge>{'{{count}}'}</badge> new
              messages
            </Trans>
          </p>

          {/* 多个组件 */}
          <p style={{ margin: '10px 0' }}>
            📖{' '}
            <Trans
              i18nKey="trans.multipleComponents"
              t={t}
              components={{
                icon: <Icon />,
                link: <a href="#" style={{ color: '#2196F3', margin: '0 4px' }} />,
                link2: <a href="#" style={{ color: '#ff9800', margin: '0 4px' }} />,
              }}
            />
          </p>

          {/* 带值的组件 */}
          <p style={{ margin: '10px 0' }}>
            💰{' '}
            <Trans
              i18nKey="trans.withValues"
              t={t}
              values={{ amount: 299, percent: 15 }}
              components={{
                price: <Price />,
                discount: <Discount />,
              }}
            />
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
          {`<Trans
  i18nKey="trans.complexNesting"
  values={{ username: '李四', count: 3 }}
  components={{
    strong: <strong />,
    badge: <Badge />
  }}
/>`}
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
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>3. {t('pluralization.title')}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          {t('pluralization.description')}
        </p>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '10px' }}>计数: {count}</label>
            <button onClick={() => setCount(0)} style={{ marginRight: '5px', padding: '5px 10px' }}>
              0
            </button>
            <button onClick={() => setCount(1)} style={{ marginRight: '5px', padding: '5px 10px' }}>
              1
            </button>
            <button onClick={() => setCount(5)} style={{ marginRight: '5px', padding: '5px 10px' }}>
              5
            </button>
            <button
              onClick={() => setCount(count + 1)}
              style={{ marginRight: '5px', padding: '5px 10px' }}
            >
              +1
            </button>
          </div>

          <p style={{ margin: '5px 0' }}>📦 {t('pluralization.item', { count })}</p>
          <p style={{ margin: '5px 0' }}>💬 {t('pluralization.message', { count })}</p>
          <p style={{ margin: '5px 0' }}>📄 {t('pluralization.file', { count })}</p>
          <p style={{ margin: '5px 0' }}>📅 {t('pluralization.day', { count })}</p>
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
  "item_zero": "没有项目",
  "item_one": "1 个项目",
  "item_other": "{{count}} 个项目"
}

// 使用
{t('pluralization.item', { count })}`}
        </pre>
      </section>

      {/* 4. 插值 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>4. {t('interpolation.title')}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          {t('interpolation.description')}
        </p>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          <p style={{ margin: '5px 0' }}>👋 {t('interpolation.simple', { name: '王五' })}</p>
          <p style={{ margin: '5px 0' }} suppressHydrationWarning>
            📊{' '}
            {t('interpolation.multiple', {
              name: '赵六',
              date: new Date().toLocaleDateString(lng === 'zh-CN' ? 'zh-CN' : 'en-US'),
              count: 8,
            })}
          </p>
          <p style={{ margin: '5px 0' }}>
            👤{' '}
            {t('interpolation.nested', {
              user: { name: '孙七', age: 25, city: lng === 'zh-CN' ? '上海' : 'Shanghai' },
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
          {`{t('interpolation.simple', { name: '王五' })}
{t('interpolation.nested', {
  user: { name: '孙七', age: 25, city: '上海' }
})}`}
        </pre>
      </section>

      {/* 5. 上下文 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>5. {t('context.title')}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          {t('context.description')}
        </p>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <button
              onClick={() => setContext(undefined)}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: context === undefined ? '#4caf50' : '#e0e0e0',
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
              }}
            >
              Female
            </button>
          </div>

          <p style={{ margin: '5px 0' }}>👥 {t('context.friend', { context })}</p>

          <div style={{ marginTop: '15px', marginBottom: '15px' }}>
            <button
              onClick={() => setMessageStatus(undefined)}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: messageStatus === undefined ? '#4caf50' : '#e0e0e0',
              }}
            >
              无状态
            </button>
            <button
              onClick={() => setMessageStatus('read')}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: messageStatus === 'read' ? '#4caf50' : '#e0e0e0',
              }}
            >
              已读
            </button>
            <button
              onClick={() => setMessageStatus('unread')}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: messageStatus === 'unread' ? '#4caf50' : '#e0e0e0',
              }}
            >
              未读
            </button>
          </div>

          <p style={{ margin: '5px 0' }}>💌 {t('context.message', { context: messageStatus })}</p>
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

      {/* 6. 嵌套翻译 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>6. {t('nesting.title')}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          {t('nesting.description')}
        </p>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          <p style={{ margin: '5px 0' }}>🔗 基础: {t('nesting.welcome')}</p>
          <p style={{ margin: '5px 0' }}>🔗 嵌套: {t('nesting.fullWelcome', { name: '周八' })}</p>
          <p style={{ margin: '5px 0' }}>🔗 页面: {t('nesting.pageTitle')}</p>
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
  "fullWelcome": "$t(nesting.welcome)回来，{{name}}！"
}

// 使用 $t() 引用另一个翻译
{t('nesting.fullWelcome', { name: '周八' })}`}
        </pre>
      </section>

      {/* 7. i18n 对象方法 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>7. {t('i18nObject.title')}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          {t('i18nObject.description')}
        </p>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          <p style={{ margin: '5px 0' }}>
            🌐 {t('i18nObject.currentLanguage')}: <strong>{i18n.language}</strong>
          </p>
          <p style={{ margin: '5px 0' }}>
            📚 {t('i18nObject.loadedNamespaces')}: <strong>{i18n.options.ns?.toString()}</strong>
          </p>
          <p style={{ margin: '5px 0' }}>
            ✅ {t('i18nObject.exists')}: <strong>{i18n.exists('api.title').toString()}</strong>
          </p>
          <p style={{ margin: '5px 0' }}>
            🔍 Key 不存在: <strong>{i18n.exists('non.existing.key').toString()}</strong>
          </p>
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {t('i18nObject.changeLanguage')} (i18n.changeLanguage)
            </button>
          </div>
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
          {`const { i18n } = useTranslation();

i18n.language          // 当前语言
i18n.changeLanguage()  // 切换语言
i18n.exists()          // 检查 key 是否存在
i18n.options.ns        // 已加载的命名空间`}
        </pre>
      </section>

      {/* 8. Key 前缀 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>8. {t('keyPrefix.title')}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          {t('keyPrefix.description')}
        </p>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          <KeyPrefixExample lng={lng} />
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
          {`// 使用 keyPrefix 简化 key 的书写
const { t } = useTranslation(lng, 'api', { keyPrefix: 'keyPrefix' });

{t('item1')}  // 实际访问 'keyPrefix.item1'
{t('item2')}  // 实际访问 'keyPrefix.item2'`}
        </pre>
      </section>

      {/* 9. Translation 组件（Render Props） */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>9. {t('translation.title')}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          {t('translation.description')}
        </p>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          <Translation>
            {t => <p style={{ margin: '5px 0' }}>📝 {t('api:translation.example')}</p>}
          </Translation>
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
          {`<Translation>
  {(t) => (
    <p>{t('api:translation.example')}</p>
  )}
</Translation>`}
        </pre>
      </section>

      {/* 10. Ready 状态 */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>10. Ready 状态检查</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          检查翻译是否已加载完成
        </p>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          <p style={{ margin: '5px 0' }}>
            ✅ Ready 状态: <strong>{ready ? t('ready.loaded') : t('ready.loading')}</strong>
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
          {`const { t, ready } = useTranslation();

if (!ready) {
  return <div>Loading translations...</div>;
}

return <div>{t('content')}</div>;`}
        </pre>
      </section>
    </div>
  );
}

// Key Prefix 示例子组件
function KeyPrefixExample({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, 'api', { keyPrefix: 'keyPrefix' });

  return (
    <>
      <p style={{ margin: '5px 0' }}>🔹 {t('item1')}</p>
      <p style={{ margin: '5px 0' }}>🔹 {t('item2')}</p>
      <p style={{ margin: '5px 0' }}>🔹 {t('item3')}</p>
    </>
  );
}
