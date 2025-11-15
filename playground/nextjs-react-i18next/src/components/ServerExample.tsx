import { useTranslation } from '@/i18n';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  userId: number;
}

// 模拟数据获取
async function fetchUserData(userId: number): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
  };
}

async function fetchUserPosts(userId: number): Promise<Post[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    { id: 1, title: 'First Post', userId },
    { id: 2, title: 'Second Post', userId },
    { id: 3, title: 'Third Post', userId },
  ];
}

export default async function ServerExample({
  lng,
  userId = 123,
}: {
  lng: string;
  userId?: number;
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = await useTranslation(lng, 'server');

  // 在服务端并行获取数据
  const [user, posts] = await Promise.all([fetchUserData(userId), fetchUserPosts(userId)]);

  const fetchTime = new Date().toLocaleString(lng === 'zh-CN' ? 'zh-CN' : 'en-US');
  const userName = t('exampleData.userName');

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f0fff0',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>{t('title')}</h2>

      <p style={{ color: '#555', marginBottom: '20px' }}>{t('description')}</p>

      {/* 主要特性 */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>{t('features.title')}</h3>

        <div style={{ display: 'grid', gap: '15px' }}>
          <div
            style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '4px',
              borderLeft: '4px solid #3498db',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', color: '#3498db' }}>{t('features.ssr.title')}</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {t('features.ssr.description')}
            </p>
          </div>

          <div
            style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '4px',
              borderLeft: '4px solid #9b59b6',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', color: '#9b59b6' }}>{t('features.seo.title')}</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {t('features.seo.description')}
            </p>
          </div>

          <div
            style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '4px',
              borderLeft: '4px solid #e67e22',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', color: '#e67e22' }}>
              {t('features.performance.title')}
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {t('features.performance.description')}
            </p>
          </div>
        </div>
      </div>

      {/* 数据获取示例 */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>{t('dataFetching.title')}</h3>

        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{t('dataFetching.userInfo')}</h4>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            {t('dataFetching.userId', { id: user.id })}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            {t('dataFetching.userName', { name: user.name })}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            {t('dataFetching.userEmail', { email: user.email })}
          </p>
        </div>

        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '4px',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{t('dataFetching.posts')}</h4>
          {posts.map(post => (
            <p key={post.id} style={{ margin: '5px 0', fontSize: '14px' }}>
              • {t('dataFetching.postTitle', { title: post.title })}
            </p>
          ))}
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
            {t('dataFetching.postCount', { count: posts.length })}
          </p>
        </div>

        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#2e7d32',
          }}
          suppressHydrationWarning
        >
          {t('dataFetching.fetchedAt', { time: fetchTime })}
        </div>
      </div>

      {/* 动态内容示例 */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>{t('dynamicContent.title')}</h3>

        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px' }}>
            {t('dynamicContent.greeting', { name: userName })}
          </p>
          <p style={{ margin: 0, fontSize: '14px' }} suppressHydrationWarning>
            {t('dynamicContent.timeMessage', { time: fetchTime })}
          </p>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {t('dynamicContent.itemCount', { count: posts.length })}
          </p>
          <p style={{ margin: 0, fontSize: '14px' }} suppressHydrationWarning>
            {t('dynamicContent.complexMessage', {
              userName: user.name,
              date: new Date().toLocaleDateString(lng === 'zh-CN' ? 'zh-CN' : 'en-US'),
              count: posts.length,
            })}
          </p>
        </div>
      </div>

      <div
        style={{
          padding: '10px',
          backgroundColor: '#d1ecf1',
          borderLeft: '4px solid #0c5460',
          borderRadius: '4px',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', color: '#0c5460' }}>{t('common:serverTip')}</p>
      </div>
    </div>
  );
}
