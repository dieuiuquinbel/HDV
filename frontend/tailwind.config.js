/**
 * File: tailwind.config.js
 * Muc dich: Cau hinh Tailwind CSS cho he thong SportBooking frontend.
 * Chuc nang: Khai bao cac thu muc scan class, dark mode va he thong bang mau WCAG AAA Velocity / Obsidian.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f4',
          100: '#ffe0e7',
          500: '#ff385c',
          600: '#ff385c',
          700: '#e00b41',
          900: '#92174d',
        },
        velocity: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        obsidian: {
          950: '#080c14',
          900: '#0f172a',
          850: '#141d33',
          800: '#1e293b',
          700: '#334155',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
