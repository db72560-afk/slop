'use client';

import { FormEvent, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Authority, TenderQuery } from '../lib/api';
import { t } from '../lib/i18n';
import { DEFAULT_DOCUMENT_TYPE, isDefaultDocumentType, isDefaultSort, SORT_OPTIONS } from '../lib/query';
import { IconClose, IconSearch } from './icons';
import { useOverlay } from './use-overlay';

export function FilterBar({
  authorities,
  values,
  today,
  activeCount,
}: {
  authorities: Authority[];
  values: TenderQuery;
  today: string;
  activeCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useOverlay(open, () => setOpen(false));
  const sortValue = `${values.sort ?? 'publicationDate'}:${values.order ?? 'desc'}`;
  const formKey = [
    values.q,
    values.authority,
    values.documentType,
    values.fppCode,
    values.minValue,
    values.maxValue,
    values.closingAfter,
    values.closingBefore,
    sortValue,
  ].join('|');

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const read = (key: string) => {
      const value = formData.get(key);
      return typeof value === 'string' ? value.trim() : '';
    };
    const set = (key: string, value: string) => {
      if (value) params.set(key, value);
    };

    set('q', read('q'));
    set('authority', read('authority'));
    set('fppCode', read('fppCode'));
    set('minValue', read('minValue'));
    set('maxValue', read('maxValue'));
    set('closingBefore', read('closingBefore'));

    const documentType = read('documentType');
    if (documentType && !isDefaultDocumentType(documentType)) params.set('documentType', documentType);

    const closingAfter = read('closingAfter');
    if (closingAfter && closingAfter !== today) params.set('closingAfter', closingAfter);

    const selected = SORT_OPTIONS.find((option) => option.value === read('sortKey')) ?? SORT_OPTIONS[0];
    if (!isDefaultSort(selected.sort, selected.order)) {
      params.set('sort', selected.sort);
      params.set('order', selected.order);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  }

  const authorityOptions = [...authorities];
  if (values.authority && !authorityOptions.some((item) => item.authority === values.authority)) {
    authorityOptions.unshift({ authority: values.authority, tenderCount: 0 });
  }

  return (
    <form key={formKey} onSubmit={submit} action="/tenders" method="get" role="search">
      <div className="sticky top-14 z-40 -mx-4 border-b border-line bg-page px-4 py-3 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
        <label htmlFor="tender-q" className="field-label">{t.search}</label>
        <div className="flex flex-col gap-2 min-[520px]:flex-row min-[520px]:items-center">
          <div className="relative min-w-0 flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              id="tender-q"
              name="q"
              defaultValue={values.q ?? ''}
              placeholder={t.searchPlaceholder}
              autoComplete="off"
              enterKeyHint="search"
              className="field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 min-[520px]:flex-none">{t.searchSubmit}</button>
            <button
              type="button"
              className="btn flex-1 min-[520px]:flex-none lg:hidden"
              aria-expanded={open}
              aria-controls="tender-filters"
              onClick={() => setOpen(true)}
            >
              {t.filters}
              {activeCount > 0 ? <span className="count-pill">{activeCount}</span> : null}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <button type="button" className="fixed inset-0 z-30 bg-[#0c1210]/45 lg:hidden" aria-label={t.closeFilters} onClick={() => setOpen(false)} />
      ) : null}

      <div
        id="tender-filters"
        ref={panelRef}
        role={open ? 'dialog' : 'region'}
        aria-modal={open ? true : undefined}
        aria-labelledby="filter-heading"
        className={`z-40 border-line bg-panel lg:static lg:z-auto lg:mt-4 lg:block lg:max-h-none lg:overflow-visible lg:rounded-lg lg:border lg:p-4 lg:shadow-none ${
          open
            ? 'fixed inset-x-0 bottom-0 flex max-h-[min(40rem,calc(100dvh-14rem))] flex-col overflow-hidden rounded-t-xl border shadow-sheet'
            : 'max-lg:hidden'
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:hidden">
          <p className="text-base font-semibold">{t.filters}</p>
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={t.closeFilters}>
            <IconClose className="h-4 w-4" />
          </button>
        </div>
        <h2 id="filter-heading" className="sr-only">{t.filters}</h2>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:overflow-visible lg:p-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 [&>*]:min-w-0">
            <label className="sm:col-span-2 lg:col-span-4">
              <span className="field-label">{t.authority}</span>
              <select name="authority" defaultValue={values.authority ?? ''} className="field" data-initial-focus>
                <option value="">{t.allAuthorities}</option>
                {authorityOptions.map((item) => (
                  <option key={item.authority} value={item.authority}>
                    {item.authority}{item.tenderCount > 0 ? ` (${item.tenderCount})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="lg:col-span-2">
              <span className="field-label">{t.documentType}</span>
              <input name="documentType" defaultValue={values.documentType ?? DEFAULT_DOCUMENT_TYPE} placeholder="B05" spellCheck={false} className="field" />
              <span className="field-hint">{t.documentTypeHint}</span>
            </label>
            <label className="lg:col-span-3">
              <span className="field-label">{t.fppCode}</span>
              <input name="fppCode" defaultValue={values.fppCode ?? ''} spellCheck={false} className="field" />
            </label>
            <label className="lg:col-span-3">
              <span className="field-label">{t.sort}</span>
              <select name="sortKey" defaultValue={SORT_OPTIONS.some((option) => option.value === sortValue) ? sortValue : SORT_OPTIONS[0].value} className="field">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="lg:col-span-3">
              <span className="field-label">{t.minValue}</span>
              <input name="minValue" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={values.minValue ?? ''} className="field tabular-nums" />
            </label>
            <label className="lg:col-span-3">
              <span className="field-label">{t.maxValue}</span>
              <input name="maxValue" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={values.maxValue ?? ''} className="field tabular-nums" />
            </label>
            <label className="lg:col-span-3">
              <span className="field-label">{t.closingAfter}</span>
              <input name="closingAfter" type="date" defaultValue={values.closingAfter ?? today} className="field tabular-nums" />
              <span className="field-hint">{t.closingAfterHint}</span>
            </label>
            <label className="lg:col-span-3">
              <span className="field-label">{t.closingBefore}</span>
              <input name="closingBefore" type="date" defaultValue={values.closingBefore ?? ''} className="field tabular-nums" />
            </label>
          </div>
        </div>

        <div className="flex gap-2 border-t border-line px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:justify-end lg:border-0 lg:px-0 lg:pb-0 lg:pt-4">
          <a href="/tenders" className="btn flex-1 lg:flex-none">{t.reset}</a>
          <button type="submit" className="btn-primary flex-1 lg:flex-none">{t.apply}</button>
        </div>
      </div>
    </form>
  );
}
