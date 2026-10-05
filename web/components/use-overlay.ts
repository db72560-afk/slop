'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useOverlay(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function nodes(): HTMLElement[] {
      return [...(root?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((node) => !node.closest('[hidden]'));
    }

    const frame = window.requestAnimationFrame(() => {
      const preferred = root?.querySelector<HTMLElement>('[data-initial-focus]');
      (preferred ?? nodes()[0])?.focus();
    });

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = nodes();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  return ref;
}
