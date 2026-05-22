/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        app: {
          bg: 'var(--app-bg)',
          sidebar: 'var(--app-sidebar)',
          surface: 'var(--app-surface)',
          border: 'var(--app-border)',
          hover: 'var(--app-hover)',
          text: 'var(--app-text)',
          muted: 'var(--app-muted)',
          accent: 'var(--app-accent)',
          'accent-hover': 'var(--app-accent-hover)',
        }
      }
    },
  },
  plugins: [],
}