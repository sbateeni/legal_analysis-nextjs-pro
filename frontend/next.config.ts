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
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // إعدادات الأمان
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            process.env.STRICT_CSP === '1'
              ? "script-src 'self'"
              : (process.env.NODE_ENV === 'production' ? "script-src 'self'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"),
            process.env.STRICT_CSP === '1'
              ? "style-src 'self'"
              : "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://generativelanguage.googleapis.com",
            "frame-ancestors 'none'",
          ].join('; '),
        },
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
        {
          key: 'Permissions-Policy',
          value: [
            'geolocation=()',
            'camera=()',
            'microphone=()',
            'payment=()',
            'usb=()',
            'accelerometer=()',
            'autoplay=(self)',
            'screen-wake-lock=()'
          ].join(', '),
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
