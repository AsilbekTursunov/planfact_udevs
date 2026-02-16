import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Optimize memory usage during compilation
    turbo: {
      memoryLimit: 8192,
    },
  },
  // Reduce memory usage
  swcMinify: true,
};

export default nextConfig;
