/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#000000',
        surface: {
          DEFAULT: '#0d0d0d',
          2: '#141414',
          3: '#1f1f1f',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.12)',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#a0a0a0',
          muted: '#5a5a5a',
        },
        accent: {
          DEFAULT: '#818cf8',  // indigo-400
          dim: 'rgba(129,140,248,0.15)',
          strong: '#6366f1',
        },
        success: '#34d399',
        warning: '#fbbf24',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        serif: ['"New York"', 'Georgia', '"Times New Roman"', 'serif'],
        mono: ['"SF Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'nav': '4.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(129,140,248,0.15)',
        'glow-sm': '0 0 10px rgba(129,140,248,0.1)',
        'card': '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        'elevated': '0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
