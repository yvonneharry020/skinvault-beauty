import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Since we use Cloudinary's own CDN optimization, disable Next.js re-optimization
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'teeka4.com',
      },
    ],
  },
};

export default nextConfig;
