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
} else if (process.env.NODE_ENV === "development") {
  module.exports = nextConfig;
} else {
  // Only load @serwist/next in production builds — it uses a webpack plugin that
  // is incompatible with turbopack (used in dev).
  const withSerwistInit = require("@serwist/next").default;
  module.exports = withSerwistInit({
    swSrc: "public/sw.ts",
    swDest: "public/sw.js",
    // We register the SW ourselves via ServiceWorkerRegistration.tsx
    register: false,
    // Don't force a full reload on reconnect — useCachedData re-validates on its own
    reloadOnOnline: false,
    // Precache offline.html so the SW can serve it when navigation fails offline
    globPublicPatterns: ["offline.html"],
  })(nextConfig);
}
