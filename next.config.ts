import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.heisoo.com',
        port: '',

        pathname: '/**',
      },
    ],
  },
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  })(nextConfig)
);
