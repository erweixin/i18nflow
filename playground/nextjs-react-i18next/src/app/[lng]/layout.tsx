import { I18nDebugProvider } from '@i18nflow/react-i18next';

export default function LngLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <html lang={lng}>
      <body>
        {children}
        {/* I18nDebugProvider 不需要包裹 children，可以直接使用自闭合标签 */}
        <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'} />
      </body>
    </html>
  );
}
