import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  // Webpack configuration for proper sql.js handling
  webpack: (config, { isServer, dev }) => {
    // Prevent bundling Node built-ins on client
    config.resolve = config.resolve || {} as any;
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      util: false,
      buffer: false,
      process: false,
      os: false,
      assert: false,
      constants: false,
      domain: false,
      events: false,
      http: false,
      https: false,
      querystring: false,
      punycode: false,
      url: false,
      string_decoder: false,
      timers: false,
      tty: false,
      vm: false,
      zlib: false,
    } as any;
    
    // Exclude sql.js from server-side bundling
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('sql.js');
      } else {
        config.externals = [config.externals, 'sql.js'];
      }
    }

    // Handle sql.js WASM files
    config.module = config.module || {} as any;
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },

  // Output configuration for better deployment
  output: 'standalone',

  // Fix workspace root inference when multiple lockfiles are present
  outputFileTracingRoot: path.join(__dirname, '..'),

  // HTTP response headers (production only) لتجنب كسر HMR في التطوير
  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/sql-wasm.wasm',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Content-Type', value: 'application/wasm' },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'Content-Security-Policy', value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://images.unsplash.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://generativelanguage.googleapis.com",
              "frame-ancestors 'none'",
            ].join('; ') },
        ],
      },
    ]
  },
}

export default nextConfig
 