/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#ffffff',
          dark: '#f5f5f5',
          darker: '#f0f0f0',
          blue: '#1a1a1a',
          purple: '#4a4a4a',
          pink: '#666666',
          green: '#2d2d2d',
          red: '#d32f2f',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 2s linear infinite',
        'glitch': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both',
        'glitch-1': 'glitch-1 0.3s cubic-bezier(.25, .46, .45, .94) both',
        'glitch-2': 'glitch-2 0.3s cubic-bezier(.25, .46, .45, .94) both',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #1a1a1a, 0 0 10px #1a1a1a' },
          '100%': { boxShadow: '0 0 20px #1a1a1a, 0 0 30px #1a1a1a' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        'glitch-1': {
          '0%': { transform: 'translate(0)', clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' },
          '20%': { transform: 'translate(-3px, 3px)', clipPath: 'polygon(0 60%, 100% 60%, 100% 100%, 0 100%)' },
          '40%': { transform: 'translate(-3px, -3px)', clipPath: 'polygon(0 10%, 100% 10%, 100% 50%, 0 50%)' },
          '60%': { transform: 'translate(3px, 3px)', clipPath: 'polygon(0 30%, 100% 30%, 100% 70%, 0 70%)' },
          '80%': { transform: 'translate(3px, -3px)', clipPath: 'polygon(0 0, 100% 0, 100% 20%, 0 20%)' },
          '100%': { transform: 'translate(0)', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
        },
        'glitch-2': {
          '0%': { transform: 'translate(0)', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
          '20%': { transform: 'translate(3px, -3px)', clipPath: 'polygon(0 15%, 100% 15%, 100% 65%, 0 65%)' },
          '40%': { transform: 'translate(3px, 3px)', clipPath: 'polygon(0 40%, 100% 40%, 100% 80%, 0 80%)' },
          '60%': { transform: 'translate(-3px, -3px)', clipPath: 'polygon(0 5%, 100% 5%, 100% 45%, 0 45%)' },
          '80%': { transform: 'translate(-3px, 3px)', clipPath: 'polygon(0 70%, 100% 70%, 100% 100%, 0 100%)' },
          '100%': { transform: 'translate(0)', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      }
    },
  },
  plugins: [],
}
