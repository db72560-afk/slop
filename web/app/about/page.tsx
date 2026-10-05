import Link from 'next/link';
import { t } from '../../lib/i18n';

export default function AboutPage() {
  return <main className="shell"><Link href="/" className="back-link">← {t.back}</Link><div className="error-panel mt-10"><p className="eyebrow">{t.brand}</p><h1>{t.aboutTitle}</h1><p>{t.stubDescription}</p></div></main>;
}
