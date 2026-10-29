/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '30': '7.5rem', // 120px for h-30 per SPEC
      },
      colors: {
        pink: {
          100: '#FCE7F3',
          200: '#FBCFE8',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
        },
        purple: {
          100: '#F3E8FF',
          400: '#C084FC',
          500: '#A855F7',
        },
        sky: {
          100: '#E0F2FE',
        },
        slate: {
          500: '#64748B',
          700: '#334155',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Open Sans"', '"Helvetica Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
