import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Audio Repeater',
    short_name: 'Repeater',
    description: 'Privacy-first audio and video repetition tool',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f0f',
    theme_color: '#0f0f0f',
    orientation: 'any',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}