import Link from 'next/link';
import { t } from '../lib/i18n';
import { listHref, type RawParams } from '../lib/query';

function pages(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const items: Array<number | 'gap'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push('gap');
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push('gap');
  items.push(total);
  return items;
}

function PageLink({ href, children }: { href: string | null; children: string }) {
  if (!href) {
    return <span className="btn pointer-events-none text-faint" aria-disabled="true">{children}</span>;
  }
  return <Link href={href} className="btn">{children}</Link>;
}

export function Pagination({ raw, page, totalPages }: { raw: RawParams; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const previous = page > 1 ? listHref(raw, page - 1) : null;
  const next = page < totalPages ? listHref(raw, page + 1) : null;

  return (
    <nav className="mt-4 flex flex-col gap-3" aria-label={t.pagination}>
      <p className="text-center text-sm tabular-nums text-muted">{t.page} {page} {t.of} {totalPages}</p>
      <div className="grid grid-cols-2 gap-2">
        <PageLink href={previous}>{t.previous}</PageLink>
        <PageLink href={next}>{t.next}</PageLink>
      </div>
      <ol className="hidden flex-wrap items-center justify-center gap-1 sm:flex">
        {pages(page, totalPages).map((item, index) => {
          if (item === 'gap') {
            return <li key={`gap-${index}`} className="px-1 text-sm text-faint" aria-hidden="true">…</li>;
          }
          return (
            <li key={item}>
              {item === page ? (
                <span aria-current="page" className="inline-flex h-10 min-w-10 items-center justify-center rounded-md bg-accent px-2 text-sm font-semibold tabular-nums text-accent-text">{item}</span>
              ) : (
                <Link href={listHref(raw, item)} className="inline-flex h-10 min-w-10 items-center justify-center rounded-md px-2 text-sm font-semibold tabular-nums text-ink hover:bg-raised">{item}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
