import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { t } from '../lib/i18n';

export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Navigimi kryesor">
      <div className="nav-inner">
        <Link href="/" className="wordmark"><span className="wordmark-mark">e</span><span>{t.brand}</span></Link>
        <div className="nav-links">
          <Link href="/tenders" className="nav-link nav-link-active">{t.navNotices}</Link>
          <span className="nav-link nav-link-muted">{t.navStats}</span>
        </div>
        <div className="nav-actions">
          <span className="account-slot">{t.account}</span>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
