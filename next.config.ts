import type { NextConfig } from "next";

/**
 * Next.js configuration optimized for performance and SEO
 */
const nextConfig: NextConfig = {
  // Fix for Node.js modules that need polyfills in the browser
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
      };
    }
    return config;
  },
  // Performance optimizations
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },
  
  // Disabled experimental features to resolve compatibility issues
  /*
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['@mui/icons-material', '@mui/material', 'date-fns', 'lodash'],
    serverExternalPackages: [],
  },
  */
  
  // Optimization for Core Web Vitals
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // SEO and accessibility enhancements
  poweredByHeader: false, // Disable the `x-powered-by` header
  
  // Cache and performance
  onDemandEntries: {
    // Number of pages to keep in memory
    maxInactiveAge: 60 * 1000, // 1 minute
    // Number of pages to cache
    pagesBufferLength: 5,
  },
  
  // Output options
  output: 'standalone', // Optimized for containerized deployments
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true, // 301 redirect
      },
      {
        source: '/feed',
        destination: '/',
        permanent: true, // 301 redirect
      },
      {
        source: '/user/:username',
        destination: '/profile/:username',
        permanent: true, // 301 redirect
      },
    ];
  },
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
