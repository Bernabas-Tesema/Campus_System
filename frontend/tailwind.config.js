/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F97316',
        secondary: '#1E293B',
        background: '#F8FAFC',
        success: '#22C55E',
        error: '#EF4444',
        text: '#0F172A',
      },
    },
  },
  plugins: [],
};
