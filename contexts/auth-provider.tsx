// contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile { id: string; username: string; }
interface AuthContextType {
  user: User | null;
  profile: Profile | null | undefined;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // This is the single, unified listener that handles EVERYTHING.
  // It eliminates all race conditions.
  useEffect(() => {
    // This is the key: We do not set loading to false until we know EVERYTHING.
    const getSessionAndProfile = async (session: Session | null) => {
      setSession(session);
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data || null);
      } else {
        setProfile(null);
      }
      // ONLY set loading to false after both session and profile are resolved.
      setLoading(false);
    };

    // onAuthStateChange fires with the initial session immediately.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await getSessionAndProfile(session);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data || null);
    }
  }, [session]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
}
