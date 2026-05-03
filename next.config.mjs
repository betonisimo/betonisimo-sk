/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Настройки оптимизации изображений (next/image)
  images: {
    remotePatterns: [
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