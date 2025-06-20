// app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-provider'; // Import the provider
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';

// Define the font once
const inter = Inter({ subsets: ['latin'] });

// Define the metadata once
export const metadata: Metadata = {
  metadataBase: new URL('https://yorival.com'), // Use your final domain here
  title: 'YoRival - Settle the Score ⚔️',
  description: 'The ultimate arena for pointless arguments and glorious victories. Vote, debate, and generate the perfect zinger.',
  keywords: 'debate, rivalry, voting, comebacks, social, arguments, discussion, fun, game',
  authors: [{ name: 'YoRival Team' }],
  creator: 'PirjQ',
  publisher: 'YoRival',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'YoRival - Settle the Score ⚔️',
    description: 'The ultimate arena for pointless arguments and glorious victories.',
    url: 'https://yorival.com',
    siteName: 'YoRival',
    type: 'website',
    images: [{
      url: 'https://yorival.com/og-image.png', // Make sure this image exists in your /public folder
      width: 1200,
      height: 630,
      alt: 'YoRival - Settle the Score',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YoRival - Settle the Score ⚔️',
    description: 'The ultimate arena for pointless arguments and glorious victories.',
    images: ['https://yorival.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

// This is a simple, non-async component. Its only job is to set up the page structure.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {/* AuthProvider is the outermost wrapper. It provides state to EVERYTHING inside it. */}
        <AuthProvider>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
