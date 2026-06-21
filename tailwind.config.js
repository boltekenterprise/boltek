/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Soft Ivory ──────────────────────────────────────────────
        ivory: {
          DEFAULT: '#FAF9F6',
          50:  '#FCFAF7',
          100: '#FAF9F6',
          200: '#F3EFE6',
          300: '#EAE2D2',
          400: '#DDD1B9',
          500: '#FAF9F6',
          600: '#EDE9DE',
          700: '#DFD9CB',
          800: '#C9BEA8',
          900: '#AFA184',
          950: '#8A7B5F',
        },
        // ── Burgundy ────────────────────────────────────────────────
        burgundy: {
          DEFAULT: '#6B1724',
          50:  '#FDF2F3',
          100: '#FCE2E6',
          200: '#FACACA',
          300: '#F4A0A0',
          400: '#EC6666',
          500: '#6B1724',
          600: '#5A121E',
          700: '#4B0F19',
          800: '#3B0B13',
          900: '#2C070D',
          950: '#1A0307',
        },
        // ── Primary accent ──────────────────────────────────────────
        scarlet: {
          DEFAULT: '#ED2100',
          50:  '#fff2f0',
          100: '#ffe0db',
          200: '#ffc1b8',
          300: '#ff9688',
          400: '#ff5a45',
          500: '#ED2100',   // ← brand Scarlet
          600: '#cc1c00',
          700: '#a81700',
          800: '#871300',
          900: '#6e1100',
          950: '#3d0900',
        },
        // ── Secondary accent ─────────────────────────────────────────
        cherry: {
          DEFAULT: '#6B1724', // Mapped to Burgundy
          50:  '#FDF2F3',
          100: '#FCE2E6',
          200: '#FACACA',
          300: '#F4A0A0',
          400: '#EC6666',
          500: '#6B1724',
          600: '#5A121E',
          700: '#4B0F19',
          800: '#3B0B13',
          900: '#2C070D',
          950: '#1A0307',
        },
        // ── Tertiary accent ──────────────────────────────────────────
        crimson: {
          DEFAULT: '#4B0F19', // Mapped to deep Burgundy
          50:  '#fdf2f2',
          100: '#fce2e2',
          200: '#facaca',
          300: '#f4a0a0',
          400: '#ec6666',
          500: '#4B0F19',
          600: '#3D0B13',
          700: '#2E080E',
          800: '#1F050A',
          900: '#150306',
          950: '#0B0103',
        },
        // ── Neutrals kept for backward compat ─────────────────────────
        flame: {
          50:  '#FFF2F0',
          100: '#FFE0DB',
          200: '#FFC1B8',
          300: '#FF9688',
          400: '#FF5A45',
          500: '#ED2100', // Scarlet (10% CTA / Highlight)
          600: '#8B1E2F', // light Burgundy
          700: '#6B1724', // Burgundy (20%)
          800: '#500F1A', // deep Burgundy
          900: '#3B0B13',
          950: '#25050A',
        },
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'slide-right':'slideRight 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
        'flicker':    'flicker 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.85' },
        },
      },
      backgroundImage: {
        'scarlet-gradient': 'linear-gradient(135deg, #B22222 0%, #D20A2E 50%, #ED2100 100%)',
        'cherry-gradient':  'linear-gradient(135deg, #D20A2E 0%, #ED2100 100%)',
        'crimson-gradient': 'linear-gradient(135deg, #7e1818 0%, #B22222 100%)',
        'dark-gradient':    'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        'hero-gradient':    'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #2a0808 100%)',
        'red-gradient':     'linear-gradient(135deg, #B22222 0%, #ED2100 100%)',
      },
    },
  },
  plugins: [],
};
