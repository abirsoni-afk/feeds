/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'sparkle-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.82)' },
        },
        'sparkle-dot': {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.7)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
      },
      animation: {
        'sparkle-pulse': 'sparkle-pulse 1.6s ease-in-out infinite',
        'sparkle-dot': 'sparkle-dot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
