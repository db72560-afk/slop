import type { Metadata } from 'next';
import { SiteNav } from '../components/site-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'e-Prokurimi Tracker',
  description: 'Browse public procurement notices from Kosovo.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <body><SiteNav />{children}</body>
    </html>
  );
}
