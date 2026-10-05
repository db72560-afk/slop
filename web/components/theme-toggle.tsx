'use client';

import { useEffect, useState } from 'react';
import { t } from '../lib/i18n';

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('theme');
    const prefersLight = saved === 'light';
    document.documentElement.classList.toggle('light', prefersLight);
    setLight(prefersLight);
  }, []);

  function toggle() {
    const next = !light;
    document.documentElement.classList.toggle('light', next);
    window.localStorage.setItem('theme', next ? 'light' : 'dark');
    setLight(next);
  }

  return (
    <button type="button" onClick={toggle} className="icon-button" aria-label={light ? t.darkMode : t.lightMode} title={light ? t.darkMode : t.lightMode}>
      <span aria-hidden="true">{light ? '☾' : '☼'}</span>
    </button>
  );
}
