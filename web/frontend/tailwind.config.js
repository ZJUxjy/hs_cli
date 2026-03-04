/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hearthstone: {
          blue: '#4a9eff',
          gold: '#ffd700',
          red: '#ff4444',
          green: '#22bb33',
          purple: '#a335ee',
          orange: '#ff8000',
        },
      },
    },
  },
  plugins: [],
}
