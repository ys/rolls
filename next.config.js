const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      // Self-hosted fonts + icon fonts — CacheFirst, long TTL
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      // Content-hashed Next.js static chunks — safe to cache forever
      urlPattern: /\/_next\/static\/.+$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 256,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      // API routes — always fresh, short network timeout
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 5
      }
    },
    {
      // App shell HTML pages — serve from cache instantly, revalidate in background
      urlPattern: /^https:\/\/rolls\.yannick\.computer(?:\/|\/archive|\/roll\/.*|\/settings.*)?$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'app-shell',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 3
      }
    }
  ]
});

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
  module.exports = withBundleAnalyzer(withPWA(nextConfig));
} else {
  module.exports = withPWA(nextConfig);
}
