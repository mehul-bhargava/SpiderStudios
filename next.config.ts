import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // Fewer build workers: the default pool crashed on Windows during "Collecting page data".
  experimental: { cpus: 2 },
};

export default nextConfig;
