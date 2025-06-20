import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'YoRival - Let\'s Settle This',
    short_name: 'YoRival',
    description: 'Join rivals, vote for your side, generate comebacks and share with the world',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#a855f7',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}