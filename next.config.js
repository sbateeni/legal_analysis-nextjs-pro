/** @type {import('next').NextConfig} */
const nextConfig = {
  // إعدادات أساسية
  reactStrictMode: true,

  // إعدادات الصور
  images: {
    unoptimized: true,
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // إعدادات الإنتاج - مهم: standalone لـ Vercel
  output: 'standalone',
  trailingSlash: false,

  // إعدادات الأمان
  poweredByHeader: false,

  // إعدادات إضافية
  experimental: {
    optimizePackageImports: ['idb-keyval'],
  },

  // إعدادات التطوير
  devIndicators: {
    position: 'bottom-right',
  },
};

module.exports = nextConfig; 