'use client';

import { useEffect } from 'react';
import { t } from '../lib/i18n';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="shell"><div className="error-panel"><p className="eyebrow">{t.brand}</p><h1>{t.errorTitle}</h1><p>{t.errorDescription}</p><button type="button" onClick={reset} className="button-primary">{t.retry}</button></div></main>;
}
