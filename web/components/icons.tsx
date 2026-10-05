type IconProps = { className?: string };

function Svg({ className = 'h-4 w-4', children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="8.5" cy="8.5" r="5.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12.6 12.6 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function IconSun({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="10" cy="10" r="3.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.4 4.4l1.3 1.3M14.3 14.3l1.3 1.3M15.6 4.4l-1.3 1.3M5.7 14.3l-1.3 1.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function IconMoon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M16 11.4A6.2 6.2 0 0 1 8.6 4 6.3 6.3 0 1 0 16 11.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconExternal({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 4.5H4.8A1.3 1.3 0 0 0 3.5 5.8v9.4A1.3 1.3 0 0 0 4.8 16.5h9.4a1.3 1.3 0 0 0 1.3-1.3V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.5 3.5H16.5V9.5M16.2 3.8 9 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4.5 10.2 8.1 13.8 15.5 6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6.5V10l2.4 1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconAlert({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 3.8 17 16.2H3L10 3.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 8.2v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 14.1h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  );
}

export function IconMinus({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 10h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}
