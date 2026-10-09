/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fixora design system: light neutral surfaces, deep charcoal text,
        // teal accent.
        brand: {
          50: '#eefbf6',
          100: '#d5f5ea',
          200: '#aeead7',
          300: '#79d8bd',
          400: '#43be9f',
          500: '#1fa385',
          600: '#11836c',
          700: '#0e6959',
          800: '#0e5347',
          900: '#0d453c',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1b9c7',
          400: '#8793a7',
          500: '#67748c',
          600: '#515d73',
          700: '#434c5e',
          800: '#2c3240',
          900: '#171a22',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(23, 26, 34, 0.04), 0 8px 24px -12px rgba(23, 26, 34, 0.18)',
      },
    },
  },
  plugins: [],
}
