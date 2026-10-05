import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '../../../components/container';
import { CopyButton } from '../../../components/copy-button';
import { DeadlineBadge } from '../../../components/deadline-badge';
import { OfficialPortalLink } from '../../../components/official-portal';
import { ApiError, getTender, type Tender } from '../../../lib/api';
import { deadlineInfo, formatDateOnly, formatDateTime, formatMoney, safeHttpUrl } from '../../../lib/format';
import { documentTypeLabel, t } from '../../../lib/i18n';

function present(value: string | null | undefined): string {
  const text = value?.trim();
  return text ? text : t.noData;
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const missing = value === t.noData;
  return (
    <div className="border-b border-line py-3">
      <dt className="text-xs font-medium uppercase tracking-[0.06em] text-faint">{label}</dt>
      <dd className={`mt-1 text-sm leading-6 ${mono ? 'break-all font-mono' : 'break-words'} ${missing ? 'text-faint' : 'font-medium text-ink'}`}>{value}</dd>
    </div>
  );
}

function SummaryCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 bg-panel px-4 py-4 sm:px-5">
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-faint">{label}</p>
      <div className="mt-2 text-sm font-medium leading-6 text-ink">{children}</div>
    </div>
  );
}

function TenderRecord({ tender }: { tender: Tender }) {
  const deadline = deadlineInfo(tender.closingDate);
  const money = formatMoney(tender.estimatedValue, tender.currency);
  const subject = tender.subject?.trim() || t.defaultSubject;
  const source = safeHttpUrl(tender.sourceUrl);
  const fields = [
    [t.procurementNo, tender.procurementNo, true],
    [t.publicationNo, present(tender.publicationNo), true],
    [t.documentType, documentTypeLabel(tender.documentType), false],
    [t.contractingAuthority, present(tender.contractingAuthority), false],
    [t.contractType, present(tender.contractType), false],
    [t.procedure, present(tender.procedureType), false],
    [t.valueBracket, present(tender.contractValueBracket), false],
    [t.estimatedValue, money, false],
    [t.currency, present(tender.currency), false],
    [t.closingDate, deadline.detail ?? t.noDeadline, false],
    [t.publicationDate, formatDateOnly(tender.publicationDate), false],
    [t.fppCode, present(tender.fppCode), true],
    [t.fppDescription, present(tender.fppDescription), false],
  ] as const;

  return (
    <>
      <Link href="/tenders" className="text-sm font-semibold text-accent-ink">← {t.back}</Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-accent-ink">{documentTypeLabel(tender.documentType)}</p>
      <h1 className="mt-2 max-w-4xl break-words text-2xl font-semibold leading-snug tracking-tight sm:text-[2rem]">{subject}</h1>
      <p className="mt-3 break-words text-base text-muted">{tender.contractingAuthority?.trim() || t.unknownAuthority}</p>

      <section aria-label={t.summary} className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCell label={t.closingDate}>
          <DeadlineBadge info={deadline} />
          <p className="mt-2 tabular-nums">{deadline.detail ?? t.noDeadline}</p>
        </SummaryCell>
        <SummaryCell label={t.estimatedValue}>
          <p className={`text-lg font-semibold tabular-nums ${money === t.noData ? 'text-faint' : ''}`}>{money}</p>
        </SummaryCell>
        <SummaryCell label={t.procedure}>
          <p className="break-words">{present(tender.procedureType)}</p>
        </SummaryCell>
        <SummaryCell label={t.publicationDate}>
          <p className="tabular-nums">{formatDateOnly(tender.publicationDate)}</p>
        </SummaryCell>
      </section>

      <section className="mt-6 border border-line bg-panel p-4 sm:p-5" aria-labelledby="official-record">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 id="official-record" className="text-xs font-medium uppercase tracking-[0.06em] text-faint">{t.procurementNo}</h2>
            <p className="mt-2 break-all font-mono text-base font-medium text-ink">{tender.procurementNo}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{t.officialPortalNote}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <OfficialPortalLink className="w-full sm:w-auto" />
            <CopyButton value={tender.procurementNo} />
          </div>
        </div>
        {source ? (
          <a href={source} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-semibold text-accent-ink">{t.sourceRecord}</a>
        ) : null}
      </section>

      <section className="mt-8" aria-labelledby="tender-fields">
        <h2 id="tender-fields" className="text-lg font-semibold tracking-tight">{t.detailsTitle}</h2>
        <dl className="mt-3 border-t border-line sm:grid sm:grid-cols-2 sm:gap-x-10">
          {fields.map(([label, value, mono]) => <Field key={label} label={label} value={value} mono={mono} />)}
        </dl>
      </section>

      <section className="mt-8" aria-labelledby="tracking">
        <h2 id="tracking" className="text-lg font-semibold tracking-tight">{t.trackingTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{t.trackingNote}</p>
        <dl className="mt-3 border-t border-line sm:grid sm:grid-cols-3 sm:gap-x-8">
          <Field label={t.firstSeenAt} value={formatDateTime(tender.firstSeenAt)} />
          <Field label={t.lastSeenAt} value={formatDateTime(tender.lastSeenAt)} />
          <Field label={t.lastChangedAt} value={formatDateTime(tender.lastChangedAt)} />
        </dl>
      </section>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const tender = await getTender(id);
    return { title: tender.subject?.trim() || t.defaultSubject };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return { title: t.notFoundTitle };
    return { title: t.detailsTitle };
  }
}

export default async function TenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const tender = await getTender(id);
    return (
      <main>
        <Container className="py-6 sm:py-8">
          <TenderRecord tender={tender} />
        </Container>
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
