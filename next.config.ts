import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: process.env.NODE_ENV === 'development' ? false : true,
  // 基础配置
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co'
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com'
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com'
      },
      {
        protocol: 'https',
        hostname: 'cdn.xreddeercasino.com'
      },
      {
        protocol: 'https',
        hostname: 'source.game24x.com'
      },
      {
        protocol: 'https',
        hostname: 'hgapi365.com'
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com'
      }
    ]
  }
};

export default nextConfig;
