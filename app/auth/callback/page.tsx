// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth-provider'; // Correct hook
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  // FIX: Get `loading` from the context, NOT `status`.
  const { loading } = useAuthContext();

  useEffect(() => {
    // Once the initial loading is false, we know the auth state is settled.
    // The AuthProvider has done its job, and we can safely redirect.
    if (!loading) {
      router.push('/');
    }
  }, [loading, router]);

  // Show a loading spinner while we wait for the initial auth check to complete.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
        <p className="text-white">Finalizing login...</p>
      </div>
    </div>
  );
}
