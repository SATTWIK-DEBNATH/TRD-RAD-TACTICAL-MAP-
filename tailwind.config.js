/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'military-dark': '#0a0a0c',
        'military-green': '#39ff14',
        'military-cyan': '#00f2ff',
        'military-panel': 'rgba(10, 10, 12, 0.85)',
        'military-border': 'rgba(0, 242, 255, 0.2)',
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(0, 242, 255, 0.1) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
