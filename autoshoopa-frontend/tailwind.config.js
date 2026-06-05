/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        "brand-orange": {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#4b1f0f",
        },
        "light-bg": "#fafafa",
        "dark-bg": "#0f0f14",
        "light-surface": "#ffffff",
        "dark-surface": "#1a1a24",
        "light-surfaceAlt": "#f5f5f5",
        "dark-surfaceAlt": "#22222e",
        "light-border": "#e5e7eb",
        "dark-border": "#2e2e3a",
        "light-borderHover": "#d1d5db",
        "dark-borderHover": "#3a3a4a",
        "light-text": "#111827",
        "dark-text": "#f1f1f4",
        "light-textSecondary": "#4b5563",
        "dark-textSecondary": "#9ca3af",
        "light-textMuted": "#9ca3af",
        "dark-textMuted": "#6b7280",
      },
    },
  },
  darkMode: "class",
  plugins: [require('@tailwindcss/forms')],
};