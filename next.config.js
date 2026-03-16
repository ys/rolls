/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Skip static optimization for all pages (API routes should never be static)
  output: 'standalone',
};

// Bundle analyzer is a dev-only tool; lazy-require so it's not needed in prod
if (process.env.ANALYZE === "true") {
  const withBundleAnalyzer = require("@next/bundle-analyzer")({ enabled: true });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}
