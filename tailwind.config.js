/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // paleta serwisu: zmiana marki w jednym miejscu.
      // `marka` (granat) to nawigacja i nagłówki, `akcent` (złoto) wyróżnia
      // aktywną pozycję i logo; `tlo` to tło obszaru roboczego.
      colors: {
        marka: {
          50: '#f2f5fb',
          100: '#e3e9f5',
          200: '#c5d1e8',
          300: '#9cb0d6',
          400: '#6d88bf',
          500: '#4a67a5',
          600: '#3a5090',
          700: '#2f4076',
          800: '#28355e',
          900: '#1e2847',
          950: '#131a30',
        },
        akcent: {
          50: '#fdf8ed',
          100: '#f9edd0',
          200: '#f3d99c',
          300: '#ebc164',
          400: '#e3ab3c',
          500: '#d18f1f',
          600: '#b2711a',
          700: '#8f5618',
          800: '#74461b',
          900: '#623b1a',
        },
        tlo: '#f5f7fb',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(19, 26, 48, 0.04), 0 10px 30px -18px rgba(19, 26, 48, 0.35)',
      },
    },
  },
  plugins: [],
}
