import { useTranslation } from 'react-i18next';

/**
 * 语言切换器组件
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div
      style={{
        padding: '15px 20px',
        backgroundColor: '#2c3e50',
        color: 'white',
        marginBottom: '20px',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <div>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{t('appTitle')}</h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>{t('appDescription')}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '14px' }}>{t('currentLanguage', { lng: i18n.language })}</span>
        <button
          onClick={() => changeLanguage('zh-CN')}
          style={{
            padding: '8px 16px',
            backgroundColor: i18n.language === 'zh-CN' ? '#4CAF50' : '#34495e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          中文
        </button>
        <button
          onClick={() => changeLanguage('en-US')}
          style={{
            padding: '8px 16px',
            backgroundColor: i18n.language === 'en-US' ? '#4CAF50' : '#34495e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          English
        </button>
      </div>
    </div>
  );
}
