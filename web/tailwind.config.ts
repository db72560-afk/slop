import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        page: 'var(--page)',
        panel: 'var(--panel)',
        raised: 'var(--raised)',
        line: 'var(--line)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-text': 'var(--accent-text)',
        'accent-ink': 'var(--accent-ink)',
        'accent-soft': 'var(--accent-soft)',
        urgent: 'var(--urgent)',
        'urgent-soft': 'var(--urgent-soft)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        sheet: '0 -16px 40px rgba(8, 16, 14, 0.28)',
      },
      maxWidth: {
        page: '80rem',
      },
    },
  },
  plugins: [],
};

export default config;
