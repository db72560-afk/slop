import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CopyButton } from '../../../components/copy-button';
import { ApiError, getTender, type Tender } from '../../../lib/api';
import { documentTypeLabel, t } from '../../../lib/i18n';

function dateValue(value: string | null): string {
  if (!value) return t.noData;
  return new Intl.DateTimeFormat('sq-AL', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value));
}

function moneyValue(value: number | null, currency: string | null): string {
  if (value === null) return t.noData;
  return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ${currency === 'EUR' || !currency ? '€' : currency}`;
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  return <div className="border-t border-slate-200 py-4"><dt className="meta-label">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value || t.noData}</dd></div>;
}

function TenderDetails({ tender }: { tender: Tender }) {
  return (
    <main className="shell">
      <Link href="/tenders" className="back-link">← {t.back}</Link>
      <div className="mt-8 flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">{documentTypeLabel(tender.documentType)}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">{tender.subject || t.defaultSubject}</h1>
          <p className="mt-4 text-base font-semibold text-slate-600">{tender.contractingAuthority || t.unknownAuthority}</p>
        </div>
        <a href="https://e-prokurimi.rks-gov.net/" target="_blank" rel="noreferrer" className="button-primary whitespace-nowrap">{t.officialPortal} ↗</a>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="detail-panel px-5 sm:px-8">
          <h2 className="section-title">{t.detailsTitle}</h2>
          <dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
            <DetailField label={t.procurementNo} value={tender.procurementNo} />
            <DetailField label={t.publicationNo} value={tender.publicationNo} />
            <DetailField label={t.documentType} value={documentTypeLabel(tender.documentType)} />
            <DetailField label={t.contractingAuthority} value={tender.contractingAuthority} />
            <DetailField label={t.contractType} value={tender.contractType} />
            <DetailField label={t.procedure} value={tender.procedureType} />
            <DetailField label={t.valueBracket} value={tender.contractValueBracket} />
            <DetailField label={t.estimatedValue} value={moneyValue(tender.estimatedValue, tender.currency)} />
            <DetailField label={t.closingDate} value={dateValue(tender.closingDate)} />
            <DetailField label={t.publicationDate} value={dateValue(tender.publicationDate)} />
            <DetailField label={t.fppCode} value={tender.fppCode} />
            <DetailField label={t.fppDescription} value={tender.fppDescription} />
          </dl>
        </div>

        <aside className="h-fit rounded-2xl bg-emerald-950 p-6 text-white shadow-lg shadow-emerald-950/10">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">{t.procurementNo}</p>
          <p className="mt-3 break-words text-lg font-bold leading-7">{tender.procurementNo}</p>
          <p className="mt-4 text-sm leading-6 text-emerald-100">{t.copyInstruction}</p>
          <div className="mt-5"><CopyButton value={tender.procurementNo} /></div>
        </aside>
      </section>
    </main>
  );
}

export default async function TenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const tender = await getTender(id);
    return <TenderDetails tender={tender} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}