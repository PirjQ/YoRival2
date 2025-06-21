// app/page.tsx
import { Suspense } from 'react';
import { AuthWrapper } from '@/components/AuthWrapper';
import { PageSkeleton } from '@/components/page-skeleton';

export default function Home() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AuthWrapper />
    </Suspense>
  );
}
