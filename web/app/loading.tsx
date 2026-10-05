import { t } from '../lib/i18n';

export default function Loading() {
  return (
    <main className="shell">
      <div className="animate-pulse">
        <div className="h-3 w-48 rounded bg-slate-200" />
        <div className="mt-4 h-12 w-3/4 rounded bg-slate-200" />
        <div className="mt-3 h-5 w-1/2 rounded bg-slate-200" />
        <div className="mt-8 h-48 rounded-2xl bg-slate-200" />
        <div className="mt-8 space-y-5 bg-white p-6 shadow-sm">
          <div className="h-5 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
      <span className="sr-only">{t.search}</span>
    </main>
  );
}
