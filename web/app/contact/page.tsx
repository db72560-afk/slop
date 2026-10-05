import Link from 'next/link';
import { Container } from '../../components/container';
import { t } from '../../lib/i18n';

export const metadata = { title: 'Kontakt' };

export default function ContactPage() {
  return (
    <main>
      <Container className="py-8 sm:py-12">
        <div className="max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-accent-ink">← {t.returnLanding}</Link>
        <div className="mt-6 border border-line bg-panel px-5 py-8 sm:px-8">
          <h1 className="text-3xl font-semibold tracking-tight">{t.contactTitle}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted">{t.contactBody}</p>
          <Link href="/tenders" className="btn-primary mt-6">{t.navNotices}</Link>
        </div>
        </div>
      </Container>
    </main>
  );
}
