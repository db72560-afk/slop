import Link from 'next/link';
import { Suspense } from 'react';
import { Container } from '../../components/container';
import { FilterBar } from '../../components/filter-bar';
import { IconClose } from '../../components/icons';
import { Pagination } from '../../components/pagination';
import { ListSkeleton } from '../../components/skeletons';
import { StateMessage } from '../../components/state-message';
import { TenderResult } from '../../components/tender-result';
import { ApiError, getAuthorities, getTenders } from '../../lib/api';
import { countLabel, formatDateOnly, formatMoney, kosovoToday } from '../../lib/format';
import { t } from '../../lib/i18n';
import { activeFilterChips, buildTenderQuery, listHref, type RawParams } from '../../lib/query';

export const metadata = { title: 'Njoftimet' };

function chipLabel(id: string, value: string): string {
  if (id === 'minValue' || id === 'maxValue') {
    const amount = Number(value);
    const name = id === 'minValue' ? t.minValue : t.maxValue;
    return `${name}: ${Number.isFinite(amount) ? formatMoney(amount, 'EUR') : value}`;
  }
  if (id === 'closingAfter') return `${t.closingAfter}: ${formatDateOnly(value)}`;
  if (id === 'closingBefore') return `${t.closingBefore}: ${formatDateOnly(value)}`;
  if (id === 'fppCode') return `${t.fppCode}: ${value}`;
  if (id === 'documentType') return `${t.documentType}: ${value}`;
  return value;
}

function scopeText(documentType: string | undefined, closingAfter: string | undefined, closingBefore: string | undefined): string {
  const until = closingBefore ? ` ${t.until} ${formatDateOnly(closingBefore)}` : '';
  return `${t.scopePrefix} ${documentType ?? 'B05'} ${t.scopeClosing} ${formatDateOnly(closingAfter)}${until}.`;
}

function failureCopy(error: unknown): string {
  return error instanceof ApiError && error.status === 400 ? t.invalidFilters : t.errorDescription;
}

async function TenderBrowser({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const today = kosovoToday();
  const query = buildTenderQuery(raw, today);
  const chips = activeFilterChips(raw, today, chipLabel);
  const [tendersResult, authoritiesResult] = await Promise.allSettled([
    getTenders(query),
    getAuthorities(),
  ]);
  const authorities = authoritiesResult.status === 'fulfilled' ? authoritiesResult.value : [];
  const result = tendersResult.status === 'fulfilled' ? tendersResult.value : null;

  return (
    <>
      <FilterBar authorities={authorities} values={query} today={today} activeCount={chips.length} />

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="max-w-3xl text-sm leading-6 text-muted">{scopeText(query.documentType, query.closingAfter, query.closingBefore)}</p>
        {result ? <p className="text-sm font-semibold tabular-nums text-ink">{countLabel(result.total)}</p> : null}
      </div>

      {chips.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h2 className="sr-only">{t.activeFilters}</h2>
          {chips.map((chip) => (
            <Link key={chip.id} href={chip.href} className="chip" aria-label={`${t.removeFilter}: ${chip.label}`}>
              <span className="max-w-[16rem] truncate">{chip.label}</span>
              <IconClose className="h-3.5 w-3.5 shrink-0" />
            </Link>
          ))}
          <Link href="/tenders" className="px-1 text-sm font-semibold text-accent-ink">{t.clearFilters}</Link>
        </div>
      ) : null}

      {result === null ? (
        <div className="mt-4">
          <StateMessage
            heading="h2"
            title={t.errorTitle}
            description={failureCopy(tendersResult.status === 'rejected' ? tendersResult.reason : null)}
            action={<Link href={listHref(raw, query.page ?? 1)} className="btn-primary">{t.retry}</Link>}
          />
        </div>
      ) : result.total === 0 ? (
        <div className="mt-4">
          <StateMessage
            heading="h2"
            title={chips.length === 0 ? t.noActiveResults : t.noResults}
            description={chips.length === 0 ? t.noActiveResultsDescription : t.noResultsDescription}
            action={chips.length > 0 ? <Link href="/tenders" className="btn-primary">{t.reset}</Link> : undefined}
          />
        </div>
      ) : result.data.length === 0 ? (
        <div className="mt-4">
          <StateMessage
            heading="h2"
            title={t.emptyPage}
            description={t.emptyPageDescription}
            action={<Link href={listHref(raw, 1)} className="btn-primary">{t.firstPage}</Link>}
          />
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-line bg-panel">
          {result.data.map((tender) => <TenderResult key={tender.id} tender={tender} />)}
        </div>
      )}

      {result && result.total > 0 ? <Pagination raw={raw} page={result.page} totalPages={result.totalPages} /> : null}
    </>
  );
}

export default function TendersPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  return (
    <main>
      <Container className="py-6 sm:py-8">
        <header className="mb-5 max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{t.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{t.subtitle}</p>
        </header>
        <Suspense fallback={<ListSkeleton />}>
          <TenderBrowser searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
