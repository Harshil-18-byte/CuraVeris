import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.{css,scss}',
  ],
  theme: {
    extend: {
      colors: {
        rzp: {
          primary: '#0F1829',
          blue: '#2962FF',
          'blue-dark': '#1A47DB',
          'blue-light': '#EEF2FF',
          'blue-surface': '#F7F9FF',
        },
        brand: {
          primary: '#0F1829',
          accent: '#2962FF',
          'accent-light': '#EEF2FF',
        },
        canvas: '#F3F4F6',
        surface: '#FFFFFF',
        subtle: '#F9FAFB',
        success: {
          DEFAULT: '#0CAF60',
          bg: '#ECFDF3',
          border: '#A7F3C4',
        },
        warning: {
          DEFAULT: '#E6A817',
          bg: '#FFFBEB',
          border: '#FDE68A',
        },
        danger: {
          DEFAULT: '#E53935',
          bg: '#FEF2F2',
          border: '#FECACA',
        },
        info: {
          DEFAULT: '#2962FF',
          bg: '#EFF6FF',
          border: '#BFDBFE',
        },
        ink: {
          primary: '#1A1A2E',
          secondary: '#687386',
          tertiary: '#A0AAB4',
          inverse: '#FFFFFF',
          accent: '#2962FF',
        },
        line: {
          subtle: '#EAECF0',
          default: '#D5D9E0',
          strong: '#B0B8C4',
          focus: '#2962FF',
        },
        border: {
          subtle: '#EAECF0',
          default: '#D5D9E0',
          strong: '#B0B8C4',
          focus: '#2962FF',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#687386',
          tertiary: '#A0AAB4',
          inverse: '#FFFFFF',
          accent: '#2962FF',
        },
        bg: {
          primary: '#FFFFFF',
          secondary: '#F3F4F6',
          tertiary: '#F9FAFB',
          elevated: '#FFFFFF',
        },
      },
      fontFamily: {
        heading: ['Mona Sans', 'Haas Grot Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
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
        '4xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.03em' }],
        '5xl': ['56px', { lineHeight: '64px', letterSpacing: '-0.04em' }],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '100px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        elevated: '0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        dropdown: '0 8px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
        modal: '0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)',
        'btn-primary': '0 1px 2px rgba(41,98,255,0.25)',
        'btn-primary-hover': '0 3px 8px rgba(41,98,255,0.35)',
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
        '26': '104px',
      },
      height: {
        'input': '36px',
        'btn': '36px',
        'btn-sm': '30px',
        'btn-lg': '42px',
        'topbar': '56px',
        'sidebar': '100vh',
        'table-row': '52px',
        'table-header': '40px',
      },
      width: {
        'sidebar': '220px',
      },
      transitionDuration: {
        '80': '80ms',
        '120': '120ms',
      },
      transitionTimingFunction: {
        'rzp': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        pulse: 'pulse 1.4s ease-in-out infinite',
        'slide-up': 'slide-up 200ms ease-out',
        'fade-in': 'fade-in 150ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
