import type { DeadlineInfo } from '../lib/format';
import { IconAlert, IconClock, IconMinus } from './icons';

const styles: Record<DeadlineInfo['kind'], string> = {
  open: 'bg-accent-soft text-accent-ink',
  soon: 'bg-urgent-soft text-urgent',
  today: 'bg-urgent-soft text-urgent',
  closed: 'bg-raised text-muted',
  none: 'bg-raised text-muted',
};

export function DeadlineBadge({ info }: { info: DeadlineInfo }) {
  const Icon = info.kind === 'closed' || info.kind === 'none' ? IconMinus : info.kind === 'open' ? IconClock : IconAlert;
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs font-semibold leading-4 ${styles[info.kind]}`} title={info.detail ?? undefined}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {info.label}
    </span>
  );
}
