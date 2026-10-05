'use client';

import { FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Authority, TenderQuery } from '../lib/api';
import { t } from '../lib/i18n';

export function FilterBar({ authorities, values }: { authorities: Authority[]; values: TenderQuery }) {
  const router = useRouter();
  const pathname = usePathname();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim()) params.set(key, value.trim());
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(240px,2fr)_minmax(190px,1fr)_repeat(2,minmax(130px,1fr))]">
        <label className="lg:col-span-2">
          <span className="field-label">{t.search}</span>
          <input name="q" defaultValue={values.q} placeholder={t.searchPlaceholder} className="field" />
        </label>
        <label>
          <span className="field-label">{t.authority}</span>
          <select name="authority" defaultValue={values.authority ?? ''} className="field">
            <option value="">{t.allAuthorities}</option>
            {authorities.map((item) => <option key={item.authority} value={item.authority}>{item.authority} ({item.tenderCount})</option>)}
          </select>
        </label>
        <label>
          <span className="field-label">{t.documentType}</span>
          <input name="documentType" defaultValue={values.documentType} placeholder="B05" className="field" />
        </label>
        <label>
          <span className="field-label">{t.minValue}</span>
          <input name="minValue" type="number" min="0" step="0.01" defaultValue={values.minValue} className="field" />
        </label>
        <label>
          <span className="field-label">{t.maxValue}</span>
          <input name="maxValue" type="number" min="0" step="0.01" defaultValue={values.maxValue} className="field" />
        </label>
        <label>
          <span className="field-label">{t.closingAfter}</span>
          <input name="closingAfter" type="date" defaultValue={values.closingAfter} className="field" />
        </label>
        <label>
          <span className="field-label">{t.closingBefore}</span>
          <input name="closingBefore" type="date" defaultValue={values.closingBefore} className="field" />
        </label>
        <label>
          <span className="field-label">{t.sort}</span>
          <select name="sort" defaultValue={values.sort ?? 'publicationDate'} className="field">
            <option value="publicationDate">{t.sortPublication}</option>
            <option value="closingDate">{t.sortClosing}</option>
            <option value="estimatedValue">{t.sortValue}</option>
          </select>
        </label>
        <label>
          <span className="field-label">{t.newest}</span>
          <select name="order" defaultValue={values.order ?? 'desc'} className="field">
            <option value="desc">{t.descending}</option>
            <option value="asc">{t.ascending}</option>
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <button type="submit" className="button-primary">{t.apply}</button>
        <a href="/tenders" className="button-secondary">{t.reset}</a>
      </div>
    </form>
  );
}
