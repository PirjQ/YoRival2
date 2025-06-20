// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth-provider'; // FIX: Import the new context hook
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  // FIX: Get the session from our new context provider
  const { session } = useAuthContext();

  useEffect(() => {
    // If the session object exists, the login was successful. Redirect home.
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  // Show a simple loading state while waiting for the session.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
        <p className="text-white">Finalizing login...</p>
      </div>
    </div>
  );
}
