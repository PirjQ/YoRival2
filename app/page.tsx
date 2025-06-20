// app/page.tsx
import { Suspense } from 'react';
import { HomePageClient } from '@/components/home-page-client';
import { PageSkeleton } from '@/components/page-skeleton';

// This is a simple, clean server component.
export default function Home() {
  return (
    // This Suspense boundary is what the error message is asking for.
    <Suspense fallback={<PageSkeleton />}>
      <HomePageClient />
    </Suspense>
  );
}
