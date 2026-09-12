import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#E6E7E1',
        plate: '#FAFAF7',
        ink: '#16191C',
        'ink-soft': '#5A6068',
        rule: '#C6C8C0',
        stamp: '#1B4D8F',
        seal: '#9A2B2B',
        amber: '#8A5A12',
      },
      fontFamily: {
        sans: ['var(--font-golos)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
      },
      boxShadow: {
        // теней в проекте нет — разделение только линовкой
        none: 'none',
      },
      keyframes: {
        stamp: {
          '0%': { opacity: '0', transform: 'scale(1.35) rotate(var(--stamp-rot, -6deg))' },
          '60%': { opacity: '1', transform: 'scale(0.94) rotate(var(--stamp-rot, -6deg))' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(var(--stamp-rot, -6deg))' },
        },
      },
      animation: {
        stamp: 'stamp 420ms cubic-bezier(0.2, 0.8, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
