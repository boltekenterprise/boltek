/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        flame: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6b6b',
          500: '#f83939',
          600: '#e51a1a',
          700: '#c11111',
          800: '#9f1212',
          900: '#841515',
          950: '#480606',
        },
        ember: {
          500: '#ff4500',
          600: '#e03d00',
        },
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-right': 'slideRight 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
        'flicker': 'flicker 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1a0000 0%, #3d0000 40%, #6b0000 100%)',
        'red-gradient': 'linear-gradient(135deg, #c11111 0%, #e51a1a 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0f0000 0%, #1a0000 100%)',
      },
    },
  },
  plugins: [],
};
