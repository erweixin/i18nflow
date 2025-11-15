import { useTranslation } from '@/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ServerExample from '@/components/ServerExample';
import ClientExample from '@/components/ClientExample';
import FormExample from '@/components/FormExample';
import AdvancedExample from '@/components/AdvancedExample';
import ApiExample from '@/components/ApiExample';

export default async function Home({ params }: { params: { lng: string } }) {
  const { lng } = params;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = await useTranslation(lng, 'common');

  return (
    <main>
      {/* 头部 */}
      <header
        style={{
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #e0e0e0',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('title')}
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#7f8c8d',
            marginBottom: '20px',
          }}
        >
          {t('description')}
        </p>
        <LanguageSwitcher lng={lng} />
      </header>

      {/* 欢迎消息 */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '30px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            color: '#495057',
            marginBottom: '10px',
          }}
        >
          {t('welcome')}
        </h2>
      </div>

      {/* 服务端渲染示例 */}
      <section style={{ marginBottom: '30px' }}>
        <ServerExample lng={lng} userId={123} />
      </section>

      {/* 客户端渲染示例 */}
      <section style={{ marginBottom: '30px' }}>
        <ClientExample lng={lng} />
      </section>

      {/* 表单示例 */}
      <section style={{ marginBottom: '30px' }}>
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fff9e6',
            borderRadius: '8px',
          }}
        >
          <FormExample lng={lng} />
        </div>
      </section>

      {/* 高级示例 */}
      <section style={{ marginBottom: '30px' }}>
        <AdvancedExample lng={lng} />
      </section>

      {/* API 示例 */}
      <section style={{ marginBottom: '30px' }}>
        <ApiExample lng={lng} />
      </section>

      {/* 页脚 */}
      <footer
        style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '2px solid #e0e0e0',
          textAlign: 'center',
          color: '#95a5a6',
          fontSize: '14px',
        }}
      >
        <p>Next.js + React-i18next Demo © 2024</p>
        <p style={{ marginTop: '8px' }}>
          Built with ❤️ using Next.js 14, React 18, and react-i18next
        </p>
      </footer>
    </main>
  );
}
