import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Primary - Vert Forêt (#3a5a40)
        primary: {
          50: '#f4f6f5',
          100: '#e3e9e5',
          200: '#c7d3cb',
          300: '#a3b5a8',
          400: '#7a9380',
          500: '#5a7a60',
          600: '#3a5a40', // Base color
          700: '#2f4834',
          800: '#283b2c',
          900: '#233226',
        },
        // Accent - Orange terre cuite (CTAs)
        accent: {
          50: '#fef8f3',
          100: '#fdeee3',
          200: '#fbd9c3',
          300: '#f8bc97',
          400: '#f4955b',
          500: '#f17528',
          600: '#e35d1e',
          700: '#bc4818',
          800: '#963b19',
          900: '#793317',
        },
        // Sentiment - Data-driven colors
        sentiment: {
          positive: '#5a7a60',
          'positive-bg': '#e3e9e5',
          neutral: '#f59e0b',
          'neutral-bg': '#fef3c7',
          negative: '#dc2626',
          'negative-bg': '#fee2e2',
        },
        // Neutral - Slate
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'ease-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.15s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'slide-down': 'slide-down 0.25s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};

export default config;
