module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // Blue
        secondary: '#10B981', // Green
        danger: '#EF4444',   // Red
        dark: {
          bg: '#1F2937',
          text: '#F9FAFB'
        },
        light: {
          bg: '#F9FAFB',
          text: '#1F2937'
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}