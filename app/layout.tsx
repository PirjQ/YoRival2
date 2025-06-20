// app/layout.tsx
import './globals.css';
import { AuthProvider } from '@/contexts/auth-provider'; // Import the new provider
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
export const metadata = { /* ... your metadata ... */ };

// This is a simple, non-async component now.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider> {/* Wrap EVERYTHING in the provider */}
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
