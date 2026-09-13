import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Плоский чёрно-белый холст вместо тёплой бумаги — раздражённо-нейтральный,
        // как бланк или инженерный чертёж, а не оформленный «под печать» лист.
        paper: '#FFFFFF',
        plate: '#F1F1EE',
        ink: '#111111',
        'ink-soft': '#5C5C5C',
        rule: '#D9D9D6',
        // Три открытых цвета конструктивистского плаката вместо приглушённой
        // офисной палитры: синий, красный, жёлтый — прямо, без полутонов.
        // Имена токенов не менялись с прошлой версии, поменялись только сами цвета.
        stamp: '#1428FF',
        seal: '#FF2600',
        amber: '#FFD500',
      },
      fontFamily: {
        // Oswald — сжатый плакатный гротеск, по умолчанию везде (заголовки,
        // кнопки, навигация, UI). IBM Plex Sans подключается точечно для
        // длинных абзацев через селектор в globals.css. Plex Mono — для
        // цифр, лейблов и служебного текста.
        sans: ['var(--font-oswald)', 'system-ui', 'sans-serif'],
        body: ['var(--font-plex-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0',
      },
      keyframes: {
        stamp: {
          '0%': { opacity: '0', transform: 'scale(1.35)' },
          '60%': { opacity: '1', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
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
