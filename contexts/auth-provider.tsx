// contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  username: string;
}

// FIX 1: This is the complete and correct type definition for your working provider.
interface AuthContextType {
  user: User | null;
  profile: Profile | null | undefined; // `undefined` will fix the flash.
  session: Session | null;
  loading: boolean; // The `loading` boolean is back.
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>; // This will fix the build error in ProfileSetup.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // FIX 2: Initialize profile as `undefined`.
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data || null); // Set to data or explicitly null
    } else {
      setProfile(null);
    }
  }, []);

  // This is YOUR WORKING useEffect that solves the "stuck" issue.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // This second useEffect fetches the profile when the session changes.
  useEffect(() => {
    if (session?.user) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [session, refreshProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // FIX 3: Add `refreshProfile` to the value object.
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
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
