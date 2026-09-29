/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#080b11',
          panel: '#0d131f',
          surface: '#121927',
          border: '#1e293b',
          borderDark: '#151d2a',
          hover: '#192235',
          cyan: '#06b6d4',
          cyanLight: '#22d3ee',
          blue: '#3b82f6',
          muted: '#64748b',
          text: '#f1f5f9',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          info: '#38bdf8',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soc: '0 4px 20px -2px rgba(0, 0, 0, 0.7)',
        glow: '0 0 15px -3px rgba(6, 182, 212, 0.25)',
      },
    },
  },
  plugins: [],
};
