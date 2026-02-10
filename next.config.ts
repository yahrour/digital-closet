import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "digital-closet-assets.s3.eu-west-3.amazonaws.com",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
