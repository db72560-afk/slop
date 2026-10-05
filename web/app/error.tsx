'use client';

import { useEffect } from 'react';
import { Container } from '../components/container';
import { StateMessage } from '../components/state-message';
import { t } from '../lib/i18n';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <Container className="py-10">
        <StateMessage
          title={t.errorTitle}
          description={t.errorDescription}
          action={<button type="button" onClick={reset} className="btn-primary">{t.retry}</button>}
        />
      </Container>
    </main>
  );
}
