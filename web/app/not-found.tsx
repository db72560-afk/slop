import Link from 'next/link';
import { t } from '../lib/i18n';

export default function NotFound() {
  return <main className="shell"><div className="error-panel"><p className="eyebrow">404</p><h1>{t.notFoundTitle}</h1><p>{t.notFoundDescription}</p><Link href="/" className="button-primary">{t.returnHome}</Link></div></main>;
}
