/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'university-red': '#722F37',
        'university-red-light': '#8B4B5C',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}