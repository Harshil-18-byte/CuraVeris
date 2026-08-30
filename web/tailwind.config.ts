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
        primary: {
          DEFAULT: "#1B4F72",
          light: "#2E86C1",
          surface: "#EBF5FB",
        },
        success: {
          DEFAULT: "#1E8449",
          surface: "#EAFAF1",
        },
        warning: {
          DEFAULT: "#B7770D",
          surface: "#FEF9E7",
        },
        danger: {
          DEFAULT: "#922B21",
          surface: "#FDEDEC",
        },
        neutral: {
          50: "#F7F7FC",
          300: "#C8C8D8",
          600: "#4A4A6A",
          900: "#1A1A2E",
        },
      },
      fontFamily: {
        heading: ["var(--font-sora)", "Sora", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
        button: "8px",
        badge: "999px",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
