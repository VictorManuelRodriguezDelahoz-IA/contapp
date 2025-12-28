/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple-inspired color system
        primary: {
          DEFAULT: '#AA73F3',
          light: '#C299F7',
          dark: '#8B4FE8',
          50: '#F5EDFF',
          100: '#EBDBFF',
          200: '#D7B7FF',
          300: '#C299F7',
          400: '#AA73F3',
          500: '#AA73F3',
          600: '#8B4FE8',
          700: '#6D2FD4',
          800: '#5320A5',
          900: '#3A1676',
        },
        secondary: {
          DEFAULT: '#FFFFFE',
          light: '#FFFFFF',
          dark: '#F5F5F7',
        },
        tertiary: {
          DEFAULT: '#1C145D',
          light: '#2C2482',
          dark: '#150F47',
          50: '#E8E6F0',
          100: '#D1CDE1',
          200: '#A39BC3',
          300: '#7569A5',
          400: '#473C87',
          500: '#1C145D',
          600: '#150F47',
          700: '#0F0B32',
          800: '#0A071E',
          900: '#05030F',
        },
        // UI colors (Apple-inspired)
        background: {
          DEFAULT: '#FFFFFE',
          light: '#FFFFFF',
          dark: '#F5F5F7',
          card: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#F5F5F7',
          light: '#FAFAFA',
          dark: '#E8E8ED',
        },
        border: {
          DEFAULT: '#D2D2D7',
          light: '#E5E5EA',
          dark: '#86868B',
        },
        text: {
          primary: '#1D1D1F',
          secondary: '#86868B',
          tertiary: '#C6C6C8',
          inverse: '#FFFFFE',
        },
        // Status colors
        success: '#30D158',
        warning: '#FF9F0A',
        error: '#FF3B30',
        info: '#007AFF',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Apple-inspired type scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.16' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        // Apple-inspired 8px grid system
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        // Apple-inspired rounded corners
        'sm': '0.375rem',
        'DEFAULT': '0.5rem',
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        // Apple-inspired shadows
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
