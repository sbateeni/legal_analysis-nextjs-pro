import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
  
  // Disable telemetry
  telemetry: false,
}

export default nextConfig
