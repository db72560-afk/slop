import Link from 'next/link';
import type { Tender } from '../lib/api';
import { deadlineInfo, formatDateOnly, formatMoney } from '../lib/format';
import { documentTypeCode, t } from '../lib/i18n';
import { DeadlineBadge } from './deadline-badge';

function Meta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const missing = value === t.noData;
  return (
    <div className="min-w-0">
      <dt className="text-xs text-faint">{label}</dt>
      <dd className={`mt-0.5 text-sm leading-5 ${mono ? 'break-all font-mono text-[0.8125rem]' : 'break-words'} ${missing ? 'text-faint' : 'text-ink'} ${label === t.procedure ? 'line-clamp-2' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

export function TenderResult({ tender }: { tender: Tender }) {
  const deadline = deadlineInfo(tender.closingDate);
  const money = formatMoney(tender.estimatedValue, tender.currency);
  const moneyMissing = money === t.noData;
  const subject = tender.subject?.trim() || t.defaultSubject;
  const authority = tender.contractingAuthority?.trim() || t.unknownAuthority;
  const when = deadline.detail ?? t.noDeadline;
  const fppCode = tender.fppCode?.trim();
  const fppText = fppCode || tender.fppDescription?.trim() || t.noData;

  return (
    <article className="border-b border-line last:border-b-0">
      <Link href={`/tenders/${tender.id}`} className="tender-row min-w-0 px-4 py-4 sm:px-5">
        <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[9.25rem_minmax(0,1fr)_11.5rem] lg:gap-6">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-2 lg:flex-col lg:flex-nowrap lg:justify-start">
            <DeadlineBadge info={deadline} />
            <p className={`shrink-0 text-right text-sm font-semibold tabular-nums lg:hidden ${moneyMissing ? 'text-faint' : 'text-ink'}`}>
              <span className="sr-only">{t.estimatedValue}: </span>
              {money}
            </p>
            <p className="hidden text-xs tabular-nums leading-5 text-muted lg:block">{when}</p>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-faint">{documentTypeCode(tender.documentType)}</p>
            <h2 className="tender-subject mt-1 break-words text-base font-semibold leading-snug text-ink">{subject}</h2>
            <p className="mt-1 break-words text-sm leading-5 text-muted">{authority}</p>
            <p className="mt-2 text-xs tabular-nums text-muted lg:hidden">{when}</p>
            <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 xl:grid-cols-4">
              <Meta label={t.procedure} value={tender.procedureType?.trim() || t.noData} />
              <Meta label={fppCode ? t.fppCode : t.fppDescription} value={fppText} />
              <Meta label={t.publicationDate} value={formatDateOnly(tender.publicationDate)} />
              <Meta label={t.procurementNo} value={tender.procurementNo} mono />
            </dl>
            <p className="mt-3 text-sm font-semibold text-accent-ink">{t.details}</p>
          </div>

          <div className={`hidden text-right lg:block ${moneyMissing ? 'text-faint' : 'text-ink'}`}>
            <p className="text-xs font-medium text-faint">{t.estimatedValue}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">{money}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
