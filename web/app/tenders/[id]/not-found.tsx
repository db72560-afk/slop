import Link from 'next/link';
import { Container } from '../../../components/container';
import { StateMessage } from '../../../components/state-message';
import { t } from '../../../lib/i18n';

export default function TenderNotFound() {
  return (
    <main>
      <Container className="py-10">
        <StateMessage
          title={t.notFoundTitle}
          description={t.notFoundDescription}
          action={<Link href="/tenders" className="btn-primary">{t.returnHome}</Link>}
        />
      </Container>
    </main>
  );
}
