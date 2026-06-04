/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          darkBlue: '#1e3a8a',
          earthBrown: '#7c4700',
          orange: {
            DEFAULT: '#f97316',
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
          }
        },
        dark: {
          bg: '#0f0f14',
          surface: '#1a1a24',
          surfaceAlt: '#22222e',
          border: '#2e2e3a',
          borderHover: '#3a3a4a',
          text: '#f1f1f4',
          textSecondary: '#9ca3af',
          textMuted: '#6b7280',
        },
        light: {
          bg: '#fafafa',
          surface: '#ffffff',
          surfaceAlt: '#f5f5f5',
          border: '#e5e7eb',
          borderHover: '#d1d5db',
          text: '#111827',
          textSecondary: '#6b7280',
          textMuted: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  corePlugins: {
    preflight: true,
  },
} 