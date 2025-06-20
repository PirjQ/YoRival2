// contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthStatus = 'initializing' | 'unauthenticated' | 'authenticated_needs_profile' | 'authenticated_ready';

interface Profile {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null; // It is defined here
  status: AuthStatus;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('initializing');

  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
    if (data) {
      setStatus('authenticated_ready');
    } else {
      setStatus('authenticated_needs_profile');
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user;
        if (!currentUser) {
          setProfile(null);
          setStatus('unauthenticated');
          return;
        }
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        setProfile(profileData);
        if (profileData) {
          setStatus('authenticated_ready');
        } else {
          setStatus('authenticated_needs_profile');
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = {
    session, // And it is provided here
    user: session?.user ?? null,
    profile,
    status,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
