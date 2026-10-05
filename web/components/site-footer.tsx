import Link from 'next/link';
import { OFFICIAL_PORTAL_URL } from '../lib/format';
import { t } from '../lib/i18n';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto grid max-w-page gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_12rem] lg:px-8">
        <div>
          <p className="text-sm font-semibold text-ink">{t.brand}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{t.independentProject}</p>
        </div>
        <nav aria-label={t.footerNav} className="flex flex-col items-start gap-2 text-sm font-medium">
          <Link href="/tenders" className="text-ink hover:text-accent-ink">{t.navNotices}</Link>
          <Link href="/about" className="text-ink hover:text-accent-ink">{t.about}</Link>
          <Link href="/contact" className="text-ink hover:text-accent-ink">{t.contact}</Link>
          <a href={OFFICIAL_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-accent-ink">{t.officialPortal}</a>
        </nav>
      </div>
    </footer>
  );
}
