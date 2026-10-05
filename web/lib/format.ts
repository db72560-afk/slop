import { t } from './i18n';

export const OFFICIAL_PORTAL_URL = 'https://e-prokurimi.rks-gov.net/';
const TIME_ZONE = 'Europe/Belgrade';

export type DeadlineKind = 'none' | 'closed' | 'today' | 'soon' | 'open';

export type DeadlineInfo = {
  kind: DeadlineKind;
  label: string;
  detail: string | null;
};

export function kosovoToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('sq-AL').format(value);
}

export function countLabel(total: number): string {
  return `${formatCount(total)} ${total === 1 ? t.resultSingular : t.results}`;
}

export function formatMoney(value: number | null, currency: string | null): string {
  if (value === null || Number.isNaN(value)) return t.noData;
  const formatted = new Intl.NumberFormat('sq-AL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  const unit = !currency || currency === 'EUR' ? '€' : currency;
  return `${formatted} ${unit}`;
}

export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return t.noData;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return formatDateTime(value);
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('sq-AL', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return t.noData;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return t.noData;
  return new Intl.DateTimeFormat('sq-AL', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

function calendarDaysBetween(fromDay: string, toDay: string): number {
  const [fromYear, fromMonth, fromDate] = fromDay.split('-').map(Number);
  const [toYear, toMonth, toDate] = toDay.split('-').map(Number);
  const from = Date.UTC(fromYear, fromMonth - 1, fromDate);
  const to = Date.UTC(toYear, toMonth - 1, toDate);
  return Math.round((to - from) / 86_400_000);
}

export function deadlineInfo(value: string | null, now = new Date()): DeadlineInfo {
  if (!value) return { kind: 'none', label: t.noDeadline, detail: null };
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return { kind: 'none', label: t.noDeadline, detail: null };

  const detail = formatDateTime(deadline);
  if (deadline.getTime() < now.getTime()) return { kind: 'closed', label: t.closed, detail };

  const deadlineDay = kosovoToday(deadline);
  const today = kosovoToday(now);
  if (deadlineDay === today) return { kind: 'today', label: t.today, detail };

  const days = calendarDaysBetween(today, deadlineDay);
  const label = `${days} ${days === 1 ? t.dayLeft : t.daysLeft}`;
  return { kind: days <= 3 ? 'soon' : 'open', label, detail };
}

export function safeHttpUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString();
  } catch {
    return null;
  }
  return null;
}
