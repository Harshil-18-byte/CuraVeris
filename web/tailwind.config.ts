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
        rzp: {
          primary: '#090B10',
          blue: '#3B82F6',
          'blue-dark': '#2563EB',
          'blue-light': '#1E293B',
          'blue-surface': '#0F172A',
        },
        brand: {
          primary: '#090B10',
          accent: '#3B82F6',
          'accent-light': 'rgba(59, 130, 246, 0.15)',
        },
        canvas: '#090B10',
        surface: '#11141C',
        subtle: '#161A24',
        success: {
          DEFAULT: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.28)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.28)',
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.28)',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: 'rgba(59, 130, 246, 0.12)',
          border: 'rgba(59, 130, 246, 0.28)',
        },
        ink: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          inverse: '#090B10',
          accent: '#60A5FA',
        },
        line: {
          subtle: '#1E2433',
          default: '#2A3347',
          strong: '#3B4764',
          focus: '#3B82F6',
        },
        border: {
          subtle: '#1E2433',
          default: '#2A3347',
          strong: '#3B4764',
          focus: '#3B82F6',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          inverse: '#090B10',
          accent: '#60A5FA',
        },
        bg: {
          primary: '#090B10',
          secondary: '#0D1017',
          tertiary: '#141822',
          elevated: '#181D2A',
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
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        elevated: '0 4px 16px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)',
        dropdown: '0 10px 25px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
        modal: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
        'btn-primary': '0 2px 8px rgba(59,130,246,0.35)',
        'btn-primary-hover': '0 4px 14px rgba(59,130,246,0.5)',
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
