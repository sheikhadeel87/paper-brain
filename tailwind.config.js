/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      keyframes: {
        pulseGlow: {
          '0%, 100%': { 'text-shadow': '0 0 0px rgba(99, 102, 241, 0)' },
          '50%': { 'text-shadow': '0 0 10px rgba(99, 102, 241, 0.6)' },
        },
      },
      animation: {
        'glow-pulse': 'pulseGlow 1.5s infinite',
      },
    },
  },
  plugins: [],
}
