import type { TenderQuery } from './api';
import { t } from './i18n';

export const DEFAULT_DOCUMENT_TYPE = 'B05';

export type RawParams = Record<string, string | string[] | undefined>;

export type SortName = NonNullable<TenderQuery['sort']>;
export type SortOrder = NonNullable<TenderQuery['order']>;

export type SortOption = {
  value: string;
  sort: SortName;
  order: SortOrder;
  label: string;
};

export const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'publicationDate:desc', sort: 'publicationDate', order: 'desc', label: t.sortNewest },
  { value: 'publicationDate:asc', sort: 'publicationDate', order: 'asc', label: t.sortOldest },
  { value: 'closingDate:asc', sort: 'closingDate', order: 'asc', label: t.sortClosingSoon },
  { value: 'closingDate:desc', sort: 'closingDate', order: 'desc', label: t.sortClosingLate },
  { value: 'estimatedValue:desc', sort: 'estimatedValue', order: 'desc', label: t.sortValueHigh },
  { value: 'estimatedValue:asc', sort: 'estimatedValue', order: 'asc', label: t.sortValueLow },
];

export function first(value: string | string[] | undefined): string | undefined {
  const item = Array.isArray(value) ? value[0] : value;
  const trimmed = item?.trim();
  return trimmed ? trimmed : undefined;
}

export function resolveSort(raw: RawParams): { sort: SortName; order: SortOrder } {
  const sortKey = first(raw.sortKey);
  const matched = SORT_OPTIONS.find((option) => option.value === sortKey);
  if (matched) return { sort: matched.sort, order: matched.order };

  const sort = first(raw.sort);
  const orderValue = first(raw.order);
  const order: SortOrder = orderValue === 'asc' ? 'asc' : 'desc';
  const resolvedSort: SortName = sort === 'closingDate' || sort === 'estimatedValue' || sort === 'publicationDate'
    ? sort
    : 'publicationDate';
  if (!sort && !orderValue) return { sort: 'publicationDate', order: 'desc' };
  return { sort: resolvedSort, order };
}

export function buildTenderQuery(raw: RawParams, today: string): TenderQuery {
  const page = Number(first(raw.page) ?? '1');
  const pageSize = Number(first(raw.pageSize) ?? '20');
  const { sort, order } = resolveSort(raw);
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 20,
    q: first(raw.q),
    authority: first(raw.authority),
    fppCode: first(raw.fppCode),
    documentType: first(raw.documentType) ?? DEFAULT_DOCUMENT_TYPE,
    minValue: first(raw.minValue),
    maxValue: first(raw.maxValue),
    closingAfter: first(raw.closingAfter) ?? today,
    closingBefore: first(raw.closingBefore),
    sort,
    order,
  };
}

export function isDefaultDocumentType(value: string | undefined): boolean {
  return (value ?? DEFAULT_DOCUMENT_TYPE).toUpperCase() === DEFAULT_DOCUMENT_TYPE;
}

export function isDefaultSort(sort: SortName, order: SortOrder): boolean {
  return sort === 'publicationDate' && order === 'desc';
}

export type FilterChip = {
  id: string;
  label: string;
  href: string;
};

function toParams(raw: RawParams, omit: string[] = []): URLSearchParams {
  const params = new URLSearchParams();
  const { sort, order } = resolveSort(raw);
  for (const [key, value] of Object.entries(raw)) {
    if (key === 'page' || key === 'sort' || key === 'order' || key === 'sortKey' || omit.includes(key)) continue;
    const item = first(value);
    if (item) params.set(key, item);
  }
  if (!omit.some((key) => key === 'sort' || key === 'sortKey') && !isDefaultSort(sort, order)) {
    params.set('sort', sort);
    params.set('order', order);
  }
  return params;
}

function hrefFrom(params: URLSearchParams): string {
  const query = params.toString();
  return query ? `/tenders?${query}` : '/tenders';
}

export function activeFilterChips(raw: RawParams, today: string, labelFor: (chipId: string, value: string) => string): FilterChip[] {
  const chips: FilterChip[] = [];
  const add = (id: string, value: string | undefined, keys = [id]) => {
    if (!value) return;
    chips.push({ id, label: labelFor(id, value), href: hrefFrom(toParams(raw, keys)) });
  };

  add('q', first(raw.q));
  add('authority', first(raw.authority));
  add('fppCode', first(raw.fppCode));
  add('minValue', first(raw.minValue));
  add('maxValue', first(raw.maxValue));
  add('closingBefore', first(raw.closingBefore));

  const documentType = first(raw.documentType);
  if (documentType && !isDefaultDocumentType(documentType)) add('documentType', documentType);

  const closingAfter = first(raw.closingAfter);
  if (closingAfter && closingAfter !== today) add('closingAfter', closingAfter);

  const { sort, order } = resolveSort(raw);
  const explicitSort = first(raw.sort) || first(raw.order) || first(raw.sortKey);
  if (explicitSort && !isDefaultSort(sort, order)) {
    const option = SORT_OPTIONS.find((item) => item.sort === sort && item.order === order);
    chips.push({
      id: 'sort',
      label: option?.label ?? t.sort,
      href: hrefFrom(toParams(raw, ['sort', 'order', 'sortKey'])),
    });
  }

  return chips;
}

export function listHref(raw: RawParams, page: number): string {
  const params = toParams(raw);
  if (page > 1) params.set('page', String(page));
  return hrefFrom(params);
}
