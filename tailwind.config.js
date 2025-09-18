/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  safelist: [
    { pattern: /(bg|text|border)-(red|blue|green|yellow|purple|pink|gray)-(100|200|300|400|500|600|700|800|900)/ },
    'absolute',
    'relative',
    'top-full',
    'right-0',
    'left-0',
    'z-10',
    'z-20',
    'z-50',
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-lg',
    'shadow-lg',
    'min-w-[120px]'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
