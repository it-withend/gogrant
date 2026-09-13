import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Тёплая крафтовая бумага вместо холодной бланковой — риф на печать
        // рисографом, а не на офисный документ.
        paper: '#F1ECDE',
        plate: '#FBF8EE',
        ink: '#17140F',
        'ink-soft': '#6B6255',
        rule: '#DED2B4',
        // Имена токенов сохранены ради совместимости с уже написанной вёрсткой —
        // поменялся только цвет за ними: раньше «канцелярские» синий/бордовый/
        // охра, теперь — палитра риск-принта (флуоресцентный оранжево-красный,
        // насыщенный кобальт, тёплая горчица).
        stamp: '#1A4FA3',
        seal: '#FF4433',
        amber: '#E8A93A',
      },
      fontFamily: {
        // Unbounded — геометрический дисплейный гротеск с характерными
        // счётчиками, используется по умолчанию везде (заголовки, кнопки,
        // навигация). PT Serif подключается отдельно для длинных абзацев
        // через выборку в globals.css (p, li, dd), поэтому здесь не описан.
        sans: ['var(--font-unbounded)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-pt-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
      },
      boxShadow: {
        // Жёсткая, не размытая тень — приём риск-графики и неубрутализма,
        // прямая противоположность мягкой серой SaaS-тени из брифа.
        hard: '5px 5px 0 0 #17140F',
        'hard-sm': '3px 3px 0 0 #17140F',
        'hard-flame': '5px 5px 0 0 #FF4433',
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
