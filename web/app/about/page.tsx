import Link from 'next/link';
import { Container } from '../../components/container';
import { OfficialPortalLink } from '../../components/official-portal';
import { t } from '../../lib/i18n';

export const metadata = { title: 'Rreth projektit' };

export default function AboutPage() {
  return (
    <main>
      <Container className="py-8 sm:py-12">
        <div className="max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-accent-ink">← {t.returnLanding}</Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{t.aboutTitle}</h1>
        <p className="mt-4 text-base leading-7 text-ink">{t.aboutLead}</p>
        <p className="mt-3 text-sm leading-6 text-muted">{t.aboutBody}</p>

        <h2 className="mt-8 text-lg font-semibold">{t.canDoTitle}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink">
          <li>{t.canDoOne}</li>
          <li>{t.canDoTwo}</li>
          <li>{t.canDoThree}</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold">{t.cannotDoTitle}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink">
          <li>{t.cannotDoOne}</li>
          <li>{t.cannotDoTwo}</li>
          <li>{t.cannotDoThree}</li>
        </ul>

        <p className="mt-8 text-sm leading-6 text-muted">{t.independentProject}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/tenders" className="btn-primary">{t.viewActive}</Link>
          <OfficialPortalLink />
        </div>
        </div>
      </Container>
    </main>
  );
}
