/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  experimental: {
    esmExternals: false
  },
  // Disable static optimization to prevent hydration issues
  unstable_runtimeJS: false
};

module.exports = nextConfig;