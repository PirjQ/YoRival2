'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { ProfileSetup } from '@/components/auth/profile-setup';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        router.push('/');
        return;
      }

      if (data.session) {
        // Wait a moment for the auth hook to update
        setTimeout(() => {
          if (profile) {
            router.push('/');
          }
          // If no profile, the ProfileSetup component will show
        }, 1000);
      } else {
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-white">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (user && !profile) {
    return <ProfileSetup userId={user.id} onComplete={() => router.push('/')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
        <p className="text-white">Redirecting...</p>
      </div>
    </div>
  );
}