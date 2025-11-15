import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next.js + React-i18next Demo',
  description: 'A complete Next.js internationalization example with SSR and client components',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
