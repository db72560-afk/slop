import Link from 'next/link';
import { FilterBar } from '../../components/filter-bar';
import { TenderCard } from '../../components/tender-card';
import { getAuthorities, getTenders, type TenderQuery } from '../../lib/api';
import { t } from '../../lib/i18n';

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildQuery(searchParams: Record<string, string | string[] | undefined>): TenderQuery {
  const sort = first(searchParams.sort);
  const order = first(searchParams.order);
  return {
    page: Number(first(searchParams.page) ?? '1'),
    pageSize: Number(first(searchParams.pageSize) ?? '20'),
    q: first(searchParams.q),
    authority: first(searchParams.authority),
    documentType: first(searchParams.documentType) ?? 'B05',
    minValue: first(searchParams.minValue),
    maxValue: first(searchParams.maxValue),
    closingAfter: first(searchParams.closingAfter) ?? today(),
    closingBefore: first(searchParams.closingBefore),
    sort: sort === 'closingDate' || sort === 'estimatedValue' ? sort : 'publicationDate',
    order: order === 'asc' ? 'asc' : 'desc',
  };
}

function pageLink(searchParams: Record<string, string | string[] | undefined>, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    const item = first(value);
    if (item) params.set(key, item);
  }
  params.set('page', String(page));
  return `/tenders?${params.toString()}`;
}

export default async function TendersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const rawParams = await searchParams;
  const query = buildQuery(rawParams);
  let result;
  let authorities;
  try {
    [result, authorities] = await Promise.all([getTenders(query), getAuthorities()]);
  } catch {
    return <main className="shell"><div className="error-panel"><p className="eyebrow">{t.brand}</p><h1>{t.errorTitle}</h1><p>{t.errorDescription}</p><Link href="/tenders" className="button-primary">{t.retry}</Link></div></main>;
  }

  return (
    <main className="shell">
      <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="display-title">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{t.subtitle}</p>
          <div className="trust-row">
            <span className="trust-chip"><i />{t.officialSource}</span>
            <span className="trust-chip"><i />{t.refreshRate}</span>
            <span className="trust-chip"><i />{result.total} {t.activeNow.toLowerCase()}</span>
          </div>
        </div>
        <div className="rounded-xl bg-emerald-950 px-4 py-3 text-white shadow-lg shadow-emerald-950/10">
          <p className="text-2xl font-bold">{result.total}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">{result.total === 1 ? t.resultSingular : t.results}</p>
        </div>
      </header>

      <FilterBar authorities={authorities} values={query} />

      <section className="stats-grid" aria-label="Përmbledhje">
        <div className="stat-card"><span className="stat-number">{result.total}</span><span className="stat-label">{t.tracked}</span></div>
        <div className="stat-card"><span className="stat-number">{result.total}</span><span className="stat-label">{t.activeNow}</span></div>
        <div className="stat-card"><span className="stat-number">{authorities.length}</span><span className="stat-label">{t.authorities}</span></div>
      </section>

      <section className="mt-8" aria-live="polite">
        {result.data.length === 0 ? (
          <div className="empty-panel"><h2>{t.noResults}</h2><p>{t.noResultsDescription}</p></div>
        ) : (
          <div className="results-stack px-1 sm:px-2">
            {result.data.map((tender) => <TenderCard key={tender.id} tender={tender} />)}
          </div>
        )}
      </section>

      {result.totalPages > 1 && (
        <nav className="mt-7 flex items-center justify-between gap-4" aria-label={t.pagination}>
          {result.page > 1 ? <Link href={pageLink(rawParams, result.page - 1)} className="button-secondary">← {t.previous}</Link> : <span />}
          <span className="text-sm font-semibold text-slate-600">{t.page} {result.page} {t.of} {result.totalPages}</span>
          {result.page < result.totalPages ? <Link href={pageLink(rawParams, result.page + 1)} className="button-secondary">{t.next} →</Link> : <span />}
        </nav>
      )}
    </main>
  );
}
