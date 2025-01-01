/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Include all files where Tailwind classes might appear
    './app/**/*.{js,jsx,ts,tsx}', // For Next.js app directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
