// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth-provider';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  // We check the `status` from the context now.
  const { status } = useAuthContext();

  useEffect(() => {
    // Once the status is no longer initializing, we know the auth check is done.
    // We can safely redirect.
    if (status !== 'initializing') {
      router.push('/');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
        <p className="text-white">Finalizing login...</p>
      </div>
    </div>
  );
}
