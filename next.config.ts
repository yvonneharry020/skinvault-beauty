import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dbtfx54dh/**',
      },
      {
        protocol: 'https',
        hostname: 'teeka4.com',
      },
    ],
  },
};

export default nextConfig;
