// tailwind.config.js

/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors'); // Import default colors if needed

module.exports = {
  content: [
    // Configure Tailwind to scan these files for classes
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // --- Define Custom Colors ---
      colors: {
        // Example Primary Color Palette (Blue-ish)
        // Replace with your actual brand colors!
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Often used as the main primary color
          600: '#2563eb', // Often used for hover/active states
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Example Secondary Color Palette (Purple-ish)
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Main secondary
          600: '#7c3aed', // Hover/active
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Example Accent Color Palette (Teal-ish - used for background shapes)
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Main accent
          600: '#0d9488', // Hover/active
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // You can also extend or override default Tailwind colors here
        // gray: colors.neutral, // Example: Use 'neutral' gray palette
      },

      // --- Define Custom Animations & Keyframes ---
      animation: {
        // For the background shapes on the login page
        blob: 'blob 7s infinite',
        // For subtle pulsing effects (optional)
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // For Ken Burns effect on Hero images
        'ken-burns': 'ken-burns 20s ease-out infinite',
        // Fade-in animations
        'fade-in-down': 'fade-in-down 0.6s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out', // Added for booking page
        // Gradient animation
        'gradient-x': 'gradient-x 15s ease infinite',
        // Subtle bounce animation - needed for booking page
        'bounce-subtle': 'bounce-subtle 4s ease-in-out infinite',
      },
      keyframes: {
        // Keyframes for the 'blob' animation
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        // Keyframes for Ken Burns effect
        'ken-burns': {
          '0%': { transform: 'scale(1) translate(0, 0)', transformOrigin: 'center center' },
          '50%': { transform: 'scale(1.15) translate(2%, -1%)', transformOrigin: 'center center' },
          '100%': { transform: 'scale(1) translate(0, 0)', transformOrigin: 'center center' },
        },
        // Keyframes for fade-in animations
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Keyframes for standard fade-in - needed for booking page
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Keyframes for bounce-subtle - needed for booking page
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        // Keyframes for gradient animation
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },

      // --- Define Custom Background Size for Gradients ---
      backgroundSize: {
        '200%': '200% 200%',
      },

      // --- Define Custom Font Families (Optional) ---
      // fontFamily: {
      //   sans: ['Inter', 'ui-sans-serif', 'system-ui', ...], // Example using Inter font
      // },
    },
  },
  plugins: [
    // Standard Tailwind plugins
    require('@tailwindcss/forms'),           // Provides base styles for form elements
    require('@tailwindcss/aspect-ratio'),    // For maintaining aspect ratios (e.g., images/videos)
    require('@tailwindcss/typography'),      // For styling blocks of prose (like in descriptions)
    
    // Custom plugin for animation delays - needed for booking page
    function({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};