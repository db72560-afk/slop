import Link from 'next/link';
import type { Tender } from '../lib/api';
import { t } from '../lib/i18n';

function formatValue(value: number | null, currency: string | null): string {
  if (value === null) return t.noData;
  return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ${currency === 'EUR' || !currency ? '€' : currency}`;
}

function formatDate(value: string | null): string {
  if (!value) return t.noDeadline;
  return new Intl.DateTimeFormat('sq-AL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function closingStatus(value: string | null): { label: string; className: string } {
  if (!value) return { label: t.noDeadline, className: 'badge-neutral' };
  const difference = new Date(value).getTime() - Date.now();
  if (difference < 0) return { label: t.closed, className: 'badge-closed' };
  const days = Math.ceil(difference / 86400000);
  return {
    label: `${days} ${days === 1 ? t.dayLeft : t.daysLeft}`,
    className: days < 3 ? 'badge-urgent' : 'badge-open',
  };
}

export function TenderCard({ tender }: { tender: Tender }) {
  const status = closingStatus(tender.closingDate);
  return (
    <article className="tender-card group">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <span>{tender.documentType ?? t.notice}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{tender.procurementNo}</span>
          </div>
          <h2 className="line-clamp-2 max-w-3xl text-lg font-bold leading-7 text-slate-900 transition group-hover:text-emerald-700">
            {tender.subject ?? t.defaultSubject}
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-600">{tender.contractingAuthority ?? t.unknownAuthority}</p>
        </div>
        <span className={status.className}>{status.label}</span>
      </div>
      <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="meta-chip"><p className="meta-label">{t.estimatedValue}</p><p className="meta-value">{formatValue(tender.estimatedValue, tender.currency)}</p></div>
        <div className="meta-chip"><p className="meta-label">{t.closingDate}</p><p className="meta-value">{formatDate(tender.closingDate)}</p></div>
        <div className="meta-chip"><p className="meta-label">{t.procedure}</p><p className="meta-value truncate">{tender.procedureType ?? t.noData}</p></div>
        <div className="meta-chip"><p className="meta-label">{t.fppCode}</p><p className="meta-value truncate">{tender.fppCode ?? tender.fppDescription ?? t.noData}</p></div>
      </div>
      <div className="mt-5">
        <Link href={`/tenders/${tender.id}`} className="text-sm font-bold text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {t.details} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
