import { languages } from '@/i18n/settings';

export async function generateStaticParams() {
  return languages.map(lng => ({ lng }));
}

export default function LngLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <html lang={params.lng}>
      <body>
        <div
          style={{
            minHeight: '100vh',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
