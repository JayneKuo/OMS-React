/** @type {import('next').NextConfig} */
const nextConfig = {
  // 优化开发体验
  experimental: {
    turbo: {
      // 启用 Turbopack (更快的打包器)
    }
  },
  // 减少编译时间
  swcMinify: true,
  // 优化图片
  images: {
    unoptimized: true
  },
  // 禁用一些开发时的检查来加速启动
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  }
};

export default nextConfig;
