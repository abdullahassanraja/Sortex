import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes are handled correctly in static exports
  trailingSlash: true,
};

export default nextConfig;
