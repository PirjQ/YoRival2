// app/page.tsx
'use client'; // This page now renders on the client

import { HomePageClient } from '@/components/home-page-client';

// This is now a simple component. No async, no data fetching.
export default function Home() {
  // It no longer fetches initialDebates. It just renders the client component.
  // The client component will handle fetching its own data.
  return <HomePageClient />;
}
