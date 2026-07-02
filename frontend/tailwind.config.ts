import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        'canvas': '#F5F5F7',
        'surface': '#FFFFFF',
        'surface-alt': '#F0F0F2',
        // Borders
        'border-subtle': '#E8E8ED',
        'border-strong': '#D1D1D6',
        // Text hierarchy
        'primary': '#1D1D1F',
        'secondary': '#6E6E73',
        'tertiary': '#AEAEB2',
        // Brand — Emerald Green
        'accent': '#059669',
        'accent-hover': '#047857',
        'accent-soft': '#ECFDF5',
        'accent-muted': '#A7F3D0',
        // Semantic
        'semantic-amber': '#FF9500',
        'semantic-red': '#FF3B30',
        'semantic-green': '#34C759',
        'semantic-blue': '#007AFF',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Apple HIG-inspired type scale
        'display': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'title-1': ['1.375rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title-2': ['1.125rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        'title-3': ['0.9375rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-strong': ['0.875rem', { lineHeight: '1.5', fontWeight: '600' }],
        'caption-1': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'caption-2': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.02em', fontWeight: '600' }],
        'micro': ['0.625rem', { lineHeight: '1.2', letterSpacing: '0.04em', fontWeight: '700' }],
      },
      boxShadow: {
        'float': '0 8px 30px -4px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 50px -12px rgba(0, 0, 0, 0.12), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
        'inner-glow': 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
        'button': '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '4xl': '28px',
        '3xl': '24px',
        '2xl': '20px',
        'xl': '16px',
        'lg': '12px',
        'md': '10px',
        'full': '999px',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
