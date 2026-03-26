import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['fluent-ffmpeg', '@ffmpeg-installer/ffmpeg', 'ffprobe-static'],
  images: {
    remotePatterns: [
      { hostname: 'picsum.photos' },
    ],
  },
};

export default nextConfig;
