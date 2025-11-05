/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverComponentsExternalPackages: ["yahoo-finance2"],
  webpack: (config, { isServer }) => {
    // Ignore problematic modules in yahoo-finance2
    config.resolve.alias = {
      ...config.resolve.alias,
      "@gadicc/fetch-mock-cache/runtimes/deno": false,
      "@gadicc/fetch-mock-cache/stores/fs": false,
      "../tests/fetchCache.js": false,
      "../tests/fetchCache": false,
    };
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
};

module.exports = nextConfig;
