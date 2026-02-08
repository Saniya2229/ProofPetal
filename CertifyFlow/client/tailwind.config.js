/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        sage: {
          50: '#f0f7f4',
          100: '#dcece4',
          200: '#bbd8ca',
          300: '#8fbfa8',
          400: '#6fa295',
          500: '#4a8a73',
          600: '#3a6f5c',
          700: '#305a4c',
          800: '#2a4a3f',
          900: '#253d35',
        },
        secondary: {
          50: '#f3f6f9',
          100: '#e5eaf0',
          200: '#c5d0dd',
          300: '#97a8be',
          400: '#647c99',
          500: '#4a627f',
          600: '#3d506a',
          700: '#354458',
          800: '#2f3b4a',
          900: '#2B3B4F',
          950: '#1c2530',
        }
      }
    },
  },
  plugins: [],
}
