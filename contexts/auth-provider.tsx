// contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  username: string;
}

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
  const [authLoading, setAuthLoading] = useState(true);

  // This is the refresh function ProfileSetup will use.
  const refreshProfile = useCallback(async () => {
    console.log("AuthProvider: refreshProfile called.");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log("AuthProvider: refreshProfile fetching for user", user.id);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      console.log("AuthProvider: refreshProfile got profile data:", data);
      setProfile(data || null); // Set to data or explicitly null
    } else {
      console.log("AuthProvider: refreshProfile found no user, setting profile to null.");
      setProfile(null);
    }
  }, []);

  // Main auth state listener
  useEffect(() => {
    console.log("AuthProvider: Main listener useEffect runs.");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`AuthProvider: onAuthStateChange fired! Event: ${_event}. Has session: ${!!session}.`);
      setSession(session);
      setAuthLoading(false);
    });
    return () => {
      console.log("AuthProvider: Main listener unsubscribes.");
      subscription.unsubscribe();
    };
  }, []);

  // Profile fetch effect - runs when session changes
  useEffect(() => {
    console.log("AuthProvider: Profile fetch useEffect runs because session changed. Session exists:", !!session);
    
    if (session?.user) {
      console.log("AuthProvider: Fetching profile for user", session.user.id);
      refreshProfile();
    } else {
      // If there is no session, we know for a fact the profile is null.
      console.log("AuthProvider: No session, setting profile to null.");
      setProfile(null);
    }
  }, [session, refreshProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading: authLoading,
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