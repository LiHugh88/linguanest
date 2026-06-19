/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#050B1E',
          800: '#0B1B3F',
          700: '#12264D',
          600: '#1B3A6B',
          500: '#2B5088',
          400: '#4B6FA8',
          300: '#7B9FD4',
          200: '#B8CDE8',
          100: '#E1EAF5',
        },
        gold: {
          500: '#E4B44A',
          400: '#F0C96A',
          300: '#F7DE99',
          200: '#FCEDC4',
          600: '#C8962B',
          700: '#9E741A',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        'glow-gold': '0 0 30px rgba(228, 180, 74, 0.3)',
        'glow-blue': '0 0 40px rgba(43, 80, 136, 0.4)',
        'card': '0 10px 40px -10px rgba(11, 27, 63, 0.5)',
      },
    },
  },
  plugins: [],
}
