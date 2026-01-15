import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Suppress TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Suppress ESLint errors during build
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/**/*'],
    },
  },
};

export default nextConfig;
