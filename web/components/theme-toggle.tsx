'use client';

import { t } from '../lib/i18n';
import { IconMoon, IconSun } from './icons';

export function ThemeToggle() {
  function toggle() {
    const nextLight = !document.documentElement.classList.contains('light');
    document.documentElement.classList.toggle('light', nextLight);
    const theme = nextLight ? 'light' : 'dark';
    window.localStorage.setItem('theme', theme);
    document.cookie = `theme=${theme};path=/;max-age=31536000;samesite=lax`;
  }

  return (
    <button type="button" onClick={toggle} className="icon-btn" aria-label={t.toggleTheme}>
      <IconSun className="icon-sun h-[1.15rem] w-[1.15rem]" />
      <IconMoon className="icon-moon h-[1.15rem] w-[1.15rem]" />
    </button>
  );
}
