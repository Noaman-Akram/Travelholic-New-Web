import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./messages/**/*.json",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        // Travelholic brand tokens — match Colors.pdf exactly
        stone: {
          DEFAULT: "#EFEDE5",
          50: "#FBFAF7",
          100: "#F6F4EE",
          200: "#EFEDE5",
          300: "#E2DFD2",
          400: "#CFCBBA",
          500: "#B6B19D",
          600: "#8E8975",
          700: "#6B6757",
          800: "#48453A",
          900: "#262521",
        },
        navy: {
          DEFAULT: "#00273E",
          50: "#E5EBF0",
          100: "#C2D0DA",
          200: "#8DA8BC",
          300: "#56809E",
          400: "#2C5980",
          500: "#003E63",
          600: "#00334F",
          700: "#00273E",
          800: "#001D2E",
          900: "#00121D",
        },
        maroon: {
          DEFAULT: "#4A1212",
          50: "#F4E5E5",
          100: "#E0BDBD",
          200: "#C58787",
          300: "#A85252",
          400: "#7E2C2C",
          500: "#4A1212",
          600: "#3D0F0F",
          700: "#2F0B0B",
          800: "#220808",
          900: "#150505",
        },
        olive: {
          DEFAULT: "#51553C",
          50: "#EEEFE9",
          100: "#D4D6C8",
          200: "#B0B49E",
          300: "#8B9075",
          400: "#6E7259",
          500: "#51553C",
          600: "#434631",
          700: "#343725",
          800: "#26281B",
          900: "#181910",
        },
        butter: {
          DEFAULT: "#F2E6B7",
          50: "#FDFAEF",
          100: "#FAF3D9",
          200: "#F2E6B7",
          300: "#E8D687",
          400: "#DCC25C",
          500: "#C9A93B",
          600: "#A38A2D",
          700: "#7E6A23",
          800: "#594B19",
          900: "#352D0F",
        },
      },
      fontFamily: {
        sans: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "Inter", "sans-serif"],
        artistic: ["var(--font-artistic)", "Georgia", "serif"],
        arabic: [
          "var(--font-arabic)",
          "Noto Naskh Arabic",
          "Tahoma",
          "sans-serif",
        ],
      },
      fontSize: {
        // [size, lineHeight] — desktop scale; responsive variants applied per-component
        display: ["5.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-mobile": [
          "4rem",
          { lineHeight: "1.05", letterSpacing: "-0.03em" },
        ],
        h1: ["3.75rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "h1-mobile": [
          "2.75rem",
          { lineHeight: "1.15", letterSpacing: "-0.02em" },
        ],
        h2: ["2.75rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "h2-mobile": ["2rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        h3: ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "h3-mobile": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h4: ["1.5rem", { lineHeight: "1.25" }],
        "h4-mobile": ["1.25rem", { lineHeight: "1.25" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.6" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
        micro: ["0.75rem", { lineHeight: "1.4" }],
        eyebrow: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.18em" }],
      },
      letterSpacing: {
        "tight-display": "-0.03em",
        "tight-heading": "-0.02em",
        eyebrow: "0.18em",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
      boxShadow: {
        editorial: "0 8px 40px -12px rgba(0,39,62,0.18)",
        "editorial-lg": "0 16px 60px -16px rgba(0,39,62,0.24)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,39,62,0.35)" },
          "50%": { boxShadow: "0 0 0 12px rgba(0,39,62,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.22,1,0.36,1) both",
        "pulse-soft": "pulse-soft 2s ease-out 3",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
