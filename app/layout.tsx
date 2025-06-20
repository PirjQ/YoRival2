import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://courageous-selkie-a8a8b1.netlify.app'),
  title: 'YoRival - Let\'s Settle This ⚔️',
  description: 'Join rivals, vote for your side, generate comebacks and share with the world.',
  keywords: 'debate, rivalry, voting, comebacks, social, arguments, discussion',
  authors: [{ name: 'YoRival Team' }],
  creator: 'YoRival',
  publisher: 'YoRival',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'YoRival - Let\'s Settle This ⚔️',
    description: 'Join rivals, vote for your side, generate comebacks and share with the world.',
    url: 'https://yorival.netlify.app',
    siteName: 'YoRival',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YoRival - Let\'s Settle This',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YoRival - Let\'s Settle This ⚔️',
    description: 'Join rivals, vote for your side, generate comebacks and share with the world.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />}>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}