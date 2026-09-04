import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.{css,scss}',
  ],
  theme: {
    extend: {
      colors: {
        gf: {
          dark: '#202128',
          canvas: '#FFFFFF',
          soft: '#F5F7FB',
          mint: '#DBF1F4',
          track: '#EDF0FB',
          teal: '#43A8B2',
          cyan: '#79C5CD',
          green: '#86C159',
          blue: '#5E84E2',
          border: 'rgba(0, 0, 0, 0.06)',
        },
        brand: {
          primary: '#202128',
          accent: '#43A8B2',
          'accent-light': '#DBF1F4',
        },
        canvas: '#F5F7FB',
        surface: '#FFFFFF',
        subtle: '#EDF0FB',
        success: {
          DEFAULT: '#2E7D32',
          bg: 'rgba(134, 193, 89, 0.15)',
          border: 'rgba(134, 193, 89, 0.3)',
        },
        warning: {
          DEFAULT: '#D97706',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
        },
        danger: {
          DEFAULT: '#DC2626',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
        },
        info: {
          DEFAULT: '#43A8B2',
          bg: 'rgba(67, 168, 178, 0.12)',
          border: 'rgba(67, 168, 178, 0.3)',
        },
        ink: {
          primary: '#202128',
          secondary: 'rgba(32, 33, 40, 0.7)',
          tertiary: 'rgba(32, 33, 40, 0.45)',
          inverse: '#FFFFFF',
          accent: '#43A8B2',
        },
        line: {
          subtle: 'rgba(0, 0, 0, 0.05)',
          default: 'rgba(0, 0, 0, 0.08)',
          strong: 'rgba(0, 0, 0, 0.15)',
          focus: '#202128',
        },
        border: {
          subtle: 'rgba(0, 0, 0, 0.05)',
          default: 'rgba(0, 0, 0, 0.08)',
          strong: 'rgba(0, 0, 0, 0.15)',
          focus: '#202128',
        },
        text: {
          primary: '#202128',
          secondary: 'rgba(32, 33, 40, 0.7)',
          tertiary: 'rgba(32, 33, 40, 0.45)',
          inverse: '#FFFFFF',
          accent: '#43A8B2',
        },
        bg: {
          primary: '#FFFFFF',
          secondary: '#F5F7FB',
          tertiary: '#EDF0FB',
          elevated: '#FFFFFF',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'Manrope', '-apple-system', 'sans-serif'],
        body: ['Manrope', 'Plus Jakarta Sans', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        xs: ['12px', { lineHeight: '18px', letterSpacing: '0.01em' }],
        sm: ['13px', { lineHeight: '20px', letterSpacing: '0' }],
        base: ['14px', { lineHeight: '22px', letterSpacing: '0' }],
        md: ['15px', { lineHeight: '24px', letterSpacing: '0' }],
        lg: ['16px', { lineHeight: '26px', letterSpacing: '-0.01em' }],
        xl: ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        '3xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.03em' }],
        '4xl': ['42px', { lineHeight: '48px', letterSpacing: '-0.03em' }],
        '5xl': ['60px', { lineHeight: '66px', letterSpacing: '-0.04em' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.04)',
        elevated: '0 10px 30px -5px rgba(0,0,0,0.06)',
        dropdown: '0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        modal: '0 30px 60px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
        'btn-primary': '0 4px 14px rgba(32, 33, 40, 0.15)',
        'btn-primary-hover': '0 6px 20px rgba(32, 33, 40, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
