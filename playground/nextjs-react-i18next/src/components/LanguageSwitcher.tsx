'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/client';

export default function LanguageSwitcher({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, 'common');
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLng: string) => {
    const newPath = pathname.replace(`/${lng}`, `/${newLng}`);
    router.push(newPath);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ marginRight: '10px', fontWeight: 'bold' }}>{t('switchLanguage')}:</label>
      <button
        onClick={() => switchLanguage('zh-CN')}
        disabled={lng === 'zh-CN'}
        style={{
          padding: '8px 16px',
          marginRight: '10px',
          backgroundColor: lng === 'zh-CN' ? '#4CAF50' : '#f0f0f0',
          color: lng === 'zh-CN' ? 'white' : 'black',
          border: 'none',
          borderRadius: '4px',
          cursor: lng === 'zh-CN' ? 'default' : 'pointer',
        }}
      >
        中文
      </button>
      <button
        onClick={() => switchLanguage('en-US')}
        disabled={lng === 'en-US'}
        style={{
          padding: '8px 16px',
          backgroundColor: lng === 'en-US' ? '#4CAF50' : '#f0f0f0',
          color: lng === 'en-US' ? 'white' : 'black',
          border: 'none',
          borderRadius: '4px',
          cursor: lng === 'en-US' ? 'default' : 'pointer',
        }}
      >
        English
      </button>
      <p style={{ marginTop: '10px', color: '#666' }}>{t('currentLanguage', { lng })}</p>
    </div>
  );
}
