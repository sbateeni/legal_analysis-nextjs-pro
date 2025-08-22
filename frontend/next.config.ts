import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إعدادات PWA
  experimental: {
    optimizePackageImports: ['idb-keyval'],
  },
  
  // تحسينات الأداء
  compress: true,
  poweredByHeader: false,
  
  // إعدادات الصور
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // إعدادات الأمان
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],
  

  
  // إعدادات التطوير
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
