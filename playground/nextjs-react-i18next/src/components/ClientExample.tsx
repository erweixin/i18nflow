'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/client';

export default function ClientExample({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, 'common');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString(lng === 'zh-CN' ? 'zh-CN' : 'en-US'));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [lng]);

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>{t('clientSideRendering')}</h2>

      <div style={{ marginBottom: '15px' }}>
        <p style={{ fontSize: '16px', color: '#34495e' }}>
          {t('lastUpdated', { date: currentTime })}
        </p>
      </div>

      <div
        style={{
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '4px',
          marginBottom: '15px',
        }}
      >
        <p style={{ marginBottom: '10px', color: '#555' }}>{t('counterExample', { count })}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setCount(count + 1)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            +1
          </button>
          <button
            onClick={() => setCount(count - 1)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            -1
          </button>
          <button
            onClick={() => setCount(0)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {t('reset')}
          </button>
        </div>
      </div>

      <div
        style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          borderLeft: '4px solid #ffc107',
          borderRadius: '4px',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>{t('clientTip')}</p>
      </div>
    </div>
  );
}
