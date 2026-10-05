import Link from 'next/link';
import { Container } from '../components/container';
import { StateMessage } from '../components/state-message';
import { t } from '../lib/i18n';

export default function NotFound() {
  return (
    <main>
      <Container className="py-10">
        <StateMessage
          title={t.pageNotFoundTitle}
          description={t.pageNotFoundDescription}
          action={<Link href="/" className="btn-primary">{t.returnLanding}</Link>}
        />
      </Container>
    </main>
  );
}
