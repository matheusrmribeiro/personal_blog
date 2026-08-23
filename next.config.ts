import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lbwydxuldlnvfrqbudan.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/post-images/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
