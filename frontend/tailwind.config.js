/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: 'hsl(var(--color-primary))',
        accent: 'hsl(var(--color-primary) / 0.3)',
        muted: {
          50: 'hsl(var(--color-muted-50))',
          950: 'hsl(var(--color-muted-950))',
        },
      },
      dropShadow: {
        soft: '0 4px 6px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
} 