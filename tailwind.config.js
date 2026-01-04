/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Badminton Kinetic Palette
        gray: {
          850: '#1f1f1f',
          900: '#121212', // Deep dark background
          950: '#0a0a0a',
        },
        neon: {
          DEFAULT: '#CCFF00', // Classic Shuttlecock/Sport Volt
          400: '#CCFF00',
          500: '#B3E600',
          glow: 'rgba(204, 255, 0, 0.15)', // For shadows
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'], // For technical data
      },
      boxShadow: {
        'neon': '0 0 20px -5px rgba(204, 255, 0, 0.3)',
        'neon-strong': '0 0 30px -5px rgba(204, 255, 0, 0.5)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}