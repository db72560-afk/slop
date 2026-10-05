'use client';

import { useState } from 'react';
import { t } from '../lib/i18n';
import { IconCheck } from './icons';

async function writeClipboard(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  area.remove();
  if (!copied) throw new Error('copy failed');
}

export function CopyButton({ value }: { value: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await writeClipboard(value);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    window.setTimeout(() => setStatus('idle'), 1800);
  }

  const label = status === 'copied' ? t.copied : status === 'failed' ? t.copyFailed : t.copy;

  return (
    <button type="button" onClick={copy} className="btn w-full sm:w-auto" aria-live="polite">
      {status === 'copied' ? <IconCheck className="h-4 w-4" /> : null}
      {label}
    </button>
  );
}
