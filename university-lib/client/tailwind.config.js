/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#15233A',
          sand: '#F3F1ED',
          accent: '#D6A85B',
          success: '#34D399',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
}
