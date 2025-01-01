/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // Ensure Turbopack is disabled
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // Add the external image domain here
  },
};

module.exports = nextConfig;
