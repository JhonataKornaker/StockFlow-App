/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#19325E',
        background: '#C5D4EB'
      }
    },
    fontFamily: {
        sans: ['Inter', 'sans-serif']
    }
  },
  plugins: [],
};
