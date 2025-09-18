/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  safelist: [
    { pattern: /(bg|text|border)-(red|blue|green|yellow|purple|pink|gray)-(100|200|300|400|500|600|700|800|900)/ }
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
