import { Configuration } from 'webpack';
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config: Configuration) => {
    // Modify Webpack config here if needed
    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // Add external image domains here
  },
  devIndicators: {
    buildActivity: false, // Hide the build activity indicator
  },
};

export default nextConfig;
