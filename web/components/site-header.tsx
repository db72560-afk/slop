'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { t } from '../lib/i18n';
import { IconClose, IconMenu } from './icons';
import { ThemeToggle } from './theme-toggle';
import { useOverlay } from './use-overlay';

function SoonItem({ label, description }: { label: string; description: string }) {
  return (
    <span className="flex items-center gap-2 text-sm text-faint" title={description}>
      <span>{label}</span>
      <span className="soon-tag">{t.comingSoon}</span>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const noticesActive = pathname.startsWith('/tenders');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useOverlay(menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = window.localStorage.getItem('theme');
    if (saved !== 'light' && saved !== 'dark') return;
    document.documentElement.classList.toggle('light', saved === 'light');
    document.cookie = `theme=${saved};path=/;max-age=31536000;samesite=lax`;
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page">
      <a href="#content" className="skip-link">{t.skipToContent}</a>
      <div className="mx-auto flex h-14 max-w-page items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label={t.brand} className="flex min-w-0 items-center gap-2 text-ink lg:mr-6">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-text">e</span>
          <span className="truncate text-sm font-semibold tracking-tight">
            e-Prokurimi
            <span className="hidden min-[420px]:inline"> Tracker</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Navigimi kryesor">
          <Link href="/tenders" aria-current={noticesActive ? 'page' : undefined} className={noticesActive ? 'text-sm font-semibold text-accent-ink' : 'text-sm font-semibold text-ink hover:text-accent-ink'}>
            {t.navNotices}
          </Link>
          <SoonItem label={t.navStats} description={t.comingSoonStats} />
          <SoonItem label={t.account} description={t.comingSoonAccount} />
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Link href="/tenders" aria-current={noticesActive ? 'page' : undefined} className={`shrink-0 px-1.5 text-sm font-semibold lg:hidden ${noticesActive ? 'text-accent-ink' : 'text-ink'}`}>
            {t.navNotices}
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <>
          <button type="button" className="fixed inset-0 top-14 z-40 bg-[#0c1210]/45 lg:hidden" aria-label={t.closeMenu} onClick={() => setMenuOpen(false)} />
          <div
            id="site-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.menu}
            className="relative z-50 border-t border-line bg-panel lg:hidden"
          >
            <nav className="mx-auto flex max-w-page flex-col gap-1 px-4 py-3" aria-label={t.menu}>
              <Link href="/tenders" className="rounded-md px-2 py-2.5 text-sm font-semibold text-ink hover:bg-raised">{t.navNotices}</Link>
              <div className="px-2 py-2.5"><SoonItem label={t.navStats} description={t.comingSoonStats} /></div>
              <div className="px-2 py-2.5"><SoonItem label={t.account} description={t.comingSoonAccount} /></div>
              <Link href="/about" className="rounded-md px-2 py-2.5 text-sm font-semibold text-ink hover:bg-raised">{t.about}</Link>
              <Link href="/contact" className="rounded-md px-2 py-2.5 text-sm font-semibold text-ink hover:bg-raised">{t.contact}</Link>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
