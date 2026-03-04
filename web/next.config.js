const BundleAnalyzer = require("@next/bundle-analyzer");

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withBundleAnalyzer(nextConfig);
