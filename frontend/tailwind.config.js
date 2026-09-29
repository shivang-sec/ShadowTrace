/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#06090e',
          panel: '#0a0e17',
          surface: '#0f1624',
          surfaceHover: '#141d2e',
          border: '#1b2537',
          borderDark: '#121927',
          borderHighlight: '#223249',
          cyan: '#06b6d4',
          cyanLight: '#22d3ee',
          cyanGlow: 'rgba(6, 182, 212, 0.15)',
          blue: '#3b82f6',
          muted: '#64748b',
          text: '#f1f5f9',
          textMuted: '#94a3b8',
          danger: '#ef4444',
          dangerGlow: 'rgba(239, 68, 68, 0.15)',
          warning: '#f59e0b',
          warningGlow: 'rgba(245, 158, 11, 0.15)',
          success: '#10b981',
          successGlow: 'rgba(16, 185, 129, 0.15)',
          info: '#38bdf8',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soc: '0 4px 24px -2px rgba(0, 0, 0, 0.75)',
        glow: '0 0 20px -2px rgba(6, 182, 212, 0.25)',
        glowSm: '0 0 10px -2px rgba(6, 182, 212, 0.2)',
        glowDanger: '0 0 15px -2px rgba(239, 68, 68, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
