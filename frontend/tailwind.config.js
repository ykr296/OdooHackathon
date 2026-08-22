/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0B0C0F",
          900: "#111318",
          850: "#15171D",
          800: "#1B1E26",
          700: "#262A34",
          600: "#383D4A",
          500: "#565C6C",
          400: "#7B8194",
          300: "#A6ABB8",
          200: "#D3D6DD",
          100: "#EEEFF2",
        },
        accent: {
          DEFAULT: "#7C5CFC",
          hover: "#8F72FD",
          soft: "#7C5CFC22",
        },
        good: "#3ECF8E",
        warn: "#EFB93E",
        bad: "#F0576B",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
