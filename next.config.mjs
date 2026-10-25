/** @type {import('next').NextConfig} */
const nextConfig = {
  // Доступ к dev-серверу с телефона через Radmin VPN.
  allowedDevOrigins: ['26.112.238.59'],

  async redirects() {
    return [{ source: '/logo.png', destination: '/Untitled.png', permanent: true }];
  },

  async headers() {
    return ['/admin/:path*', '/auth/:path*', '/api/:path*'].map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }));
  },

  // 1. Настройки оптимизации изображений (next/image)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qpnfati7bqe4yjvy.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pvulhvwjkkixdqbl.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 2. Экспериментальные настройки (Server Actions)
  experimental: {
    serverActions: {
      // Увеличиваем лимит тела запроса для загрузки файлов через Server Actions
      bodySizeLimit: '5mb', 
    },
  },
};

export default nextConfig;
