import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack configuration for better sql.js handling
  turbopack: {
    rules: {
      // Handle sql.js WASM files properly
      '*.wasm': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
    resolveAlias: {
      // Provide empty implementations for Node.js modules that sql.js tries to use
      fs: './empty-module.js',
      path: './empty-module.js',
      crypto: './empty-module.js',
      stream: './empty-module.js',
      util: './empty-module.js',
      buffer: './empty-module.js',
      process: './empty-module.js',
    },
  },

  // Webpack fallback for when not using Turbopack
  webpack: (config, { isServer }) => {
    // Only apply webpack config when not using Turbopack
    if (!process.env.TURBOPACK) {
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
      } as any;
      
      // Exclude sql.js from server-side bundling
      if (isServer) {
        config.externals = config.externals || [];
        config.externals.push('sql.js');
      }
    }
    
    return config;
  },
}

export default nextConfig
