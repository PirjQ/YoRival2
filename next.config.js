/** @type {import('next').NextConfig} */
const nextConfig = {
  // The output: 'export' line is GONE. This is the key.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
};

module.exports = nextConfig;
