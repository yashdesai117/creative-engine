import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        // Core dark backgrounds
        base: {
          50: "#f8f8ff",
          100: "#f0f0ff",
          900: "#080810",
          950: "#05050b",
        },
        surface: {
          0: "#080810",
          1: "#0d0d1a",
          2: "#121220",
          3: "#181826",
          4: "#1e1e30",
          5: "#24243c",
        },
        // Primary accent - indigo/violet
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Secondary accent - violet
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        // Highlight - cyan/teal
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        // Success
        emerald: {
          400: "#34d399",
          500: "#10b981",
        },
        // Warning
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        // Error
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
        },
        // Borders and subtle elements
        border: {
          subtle: "rgba(99, 102, 241, 0.12)",
          default: "rgba(99, 102, 241, 0.2)",
          strong: "rgba(99, 102, 241, 0.35)",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
        "gradient-brand-soft": "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)",
        "gradient-surface": "linear-gradient(180deg, #0d0d1a 0%, #080810 100%)",
        "gradient-card": "linear-gradient(145deg, rgba(30,30,48,0.8) 0%, rgba(18,18,32,0.6) 100%)",
        "gradient-glow": "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        "glow-sm": "0 0 20px rgba(99, 102, 241, 0.15)",
        "glow": "0 0 40px rgba(99, 102, 241, 0.2)",
        "glow-lg": "0 0 80px rgba(99, 102, 241, 0.25)",
        "glow-brand": "0 4px 32px rgba(99, 102, 241, 0.35)",
        "card": "0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        "card-hover": "0 2px 8px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)",
        "modal": "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)",
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backdropBlur: {
        "xs": "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "border-flow": "borderFlow 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(99,102,241,0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        borderFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
