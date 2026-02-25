/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Geist'", '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      colors: {
        dark: {
          bg: '#09090b',
          card: '#0c0c10',
          input: '#111318',
          border: '#1e2028',
          hover: '#1a1a2e',
        },
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        pulse: 'pulse 1s infinite',
      },
    },
  },
  plugins: [],
}
