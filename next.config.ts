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
    ],
    // 禁用图片优化，避免外部图片服务器访问问题导致 400 错误
    // Next.js 的图片优化器可能无法访问某些外部图片服务器（如 hgapi365.com）
    // 设置为 true 可以跳过优化，直接使用原始图片 URL
    unoptimized: true
  }
};

export default nextConfig;
