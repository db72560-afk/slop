import { t } from '../lib/i18n';

function Bar({ className }: { className: string }) {
  return <div className={`rounded bg-raised ${className}`} />;
}

export function MetricSkeleton() {
  return (
    <div className="grid border border-line bg-panel min-[480px]:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="border-t border-line px-4 py-4 first:border-t-0 min-[480px]:border-l min-[480px]:border-t-0 min-[480px]:first:border-l-0">
          <Bar className="h-8 w-16" />
          <Bar className="mt-3 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ResultSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="border-b border-line px-4 py-4 last:border-b-0 sm:px-5">
          <Bar className="h-6 w-28" />
          <Bar className="mt-3 h-5 w-4/5" />
          <Bar className="mt-2 h-4 w-1/2" />
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <Bar className="h-8" />
            <Bar className="h-8" />
            <Bar className="h-8" />
            <Bar className="h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="animate-pulse">
      <p className="sr-only">{t.loading}</p>
      <Bar className="h-11 w-full" />
      <Bar className="mt-4 h-40 w-full" />
      <div className="mt-4"><ResultSkeleton rows={5} /></div>
    </div>
  );
}
