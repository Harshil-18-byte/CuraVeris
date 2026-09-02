import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          elevated: "var(--bg-elevated)",
          overlay: "var(--bg-overlay)",
        },
        brand: {
          primary: "var(--brand-primary)",
          accent: "var(--brand-accent)",
          "accent-light": "var(--brand-accent-light)",
        },
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-bg)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          bg: "var(--warning-bg)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          bg: "var(--danger-bg)",
        },
        info: {
          DEFAULT: "var(--info)",
          bg: "var(--info-bg)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          inverse: "var(--text-inverse)",
          accent: "var(--text-accent)",
        },
        border: {
          subtle: "var(--border-subtle)",
          default: "var(--border-default)",
          strong: "var(--border-strong)",
          focus: "var(--border-focus)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "16px", letterSpacing: "0.02em" }],
        sm: ["13px", { lineHeight: "20px", letterSpacing: "0.01em" }],
        base: ["15px", { lineHeight: "24px", letterSpacing: "0" }],
        lg: ["17px", { lineHeight: "28px", letterSpacing: "-0.01em" }],
        xl: ["20px", { lineHeight: "30px", letterSpacing: "-0.02em" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em" }],
        "3xl": ["30px", { lineHeight: "38px", letterSpacing: "-0.03em" }],
        "4xl": ["36px", { lineHeight: "44px", letterSpacing: "-0.03em" }],
        "5xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.04em" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        float: "var(--shadow-float)",
      },
      spacing: {
        "4px": "4px",
        "8px": "8px",
        "12px": "12px",
        "16px": "16px",
        "20px": "20px",
        "24px": "24px",
        "32px": "32px",
        "40px": "40px",
        "48px": "48px",
        "64px": "64px",
        "80px": "80px",
        "96px": "96px",
      },
    },
  },
  plugins: [],
};

export default config;
