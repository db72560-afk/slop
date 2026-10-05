import { OFFICIAL_PORTAL_URL } from '../lib/format';
import { t } from '../lib/i18n';
import { IconExternal } from './icons';

export function OfficialPortalLink({ className = '' }: { className?: string }) {
  return (
    <a href={OFFICIAL_PORTAL_URL} target="_blank" rel="noopener noreferrer" className={`btn-primary ${className}`}>
      {t.officialPortal}
      <IconExternal className="h-4 w-4" />
    </a>
  );
}
