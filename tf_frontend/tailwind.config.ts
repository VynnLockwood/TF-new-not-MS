/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Include all files in the 'src' directory
    './app/**/*.{js,jsx,ts,tsx}', // Include files in the 'app' directory (for Next.js app routing)
    './pages/**/*.{js,jsx,ts,tsx}', // Include files in the 'pages' directory (for standard Next.js routing)
    './components/**/*.{js,jsx,ts,tsx}', // Include all components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
