import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import './globals.css';

const sans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'e-Prokurimi Tracker',
    template: '%s · e-Prokurimi Tracker',
  },
  description: 'Kërkoni njoftime të prokurimit publik të publikuara në e-Prokurimi.',
};

const themeScript = `
try {
  var saved = localStorage.getItem('theme');
  if (saved === 'light') document.documentElement.classList.add('light');
  if (saved === 'dark') document.documentElement.classList.remove('light');
} catch (e) {}
`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = (await cookies()).get('theme')?.value;
  const light = theme === 'light';

  return (
    <html lang="sq" className={`${sans.variable} ${mono.variable}${light ? ' light' : ''}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-page font-sans text-ink antialiased">
        <Script id="theme-init" strategy="beforeInteractive">{themeScript}</Script>
        <SiteHeader />
        <div id="content" className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
