/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brutal-bg': '#F4F4F0',
        'brutal-yellow': '#FFD500',
        'brutal-pink': '#FF90E8',
        'brutal-blue': '#23A094',
        'brutal-black': '#1E1E1E',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(30, 30, 30, 1)',
        'brutal-sm': '2px 2px 0px 0px rgba(30, 30, 30, 1)',
        'brutal-lg': '8px 8px 0px 0px rgba(30, 30, 30, 1)',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Inter"', 'sans-serif'], 
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}