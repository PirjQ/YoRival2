import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { HomePageClient } from '@/components/home-page-client';
import { PageSkeleton } from '@/components/page-skeleton';

// Note: We don't define the 'Debate' type here again because HomePageClient handles it.

// This is a Server Component, so it can be 'async'.
export default async function Home() {
  
  // 1. Fetch initial data on the server when the user first visits.
  const { data: initialDebates, error } = await supabase
    .from('debates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // You can log server-side errors, they will appear in your Netlify build logs.
  if (error) {
    console.error('Server-side error fetching initial debates:', error.message);
  }

  // 2. Render the loading skeleton while the client-side code loads.
  return (
    <Suspense fallback={<PageSkeleton />}>
      {/* 3. Render the client component, passing the initial data to it. */}
      {/* The client component will handle all interactivity from here. */}
      <HomePageClient initialDebates={initialDebates || []} />
    </Suspense>
  );
}