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
  // FIX: Initialize profile as `undefined`. `undefined` now means "we don't know yet".
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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

  // This is YOUR WORKING useEffect that solves the "stuck" issue.
  useEffect(() => {
    console.log("AuthProvider: Main listener useEffect runs.");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`AuthProvider: onAuthStateChange fired! Event: ${_event}. Has session: ${!!session}. Setting loading to false.`);
      setSession(session);
      setLoading(false);
    });
    return () => {
      console.log("AuthProvider: Main listener unsubscribes.");
      subscription.unsubscribe();
    };
  }, []);

  // This second useEffect fetches the profile when the session changes.
  useEffect(() => {
    console.log("AuthProvider: Profile fetch useEffect runs because session changed. Session exists:", !!session);
    if (session?.user) {
      // Only reset profile to null if this is the very first load
      // or if the user ID has actually changed
      if (!initialLoadComplete || (profile && profile.id !== session.user.id)) {
        console.log("AuthProvider: Resetting profile and fetching new data");
        setProfile(undefined);
      }
      refreshProfile().then(() => {
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      });
    } else {
      // If there is no session, we know for a fact the profile is null.
      console.log("AuthProvider: No session, setting profile to null.");
      setProfile(null);
      setInitialLoadComplete(true);
    }
  }, [session, refreshProfile, profile, initialLoadComplete]);

  const signOut = useCallback(async () => {
    setInitialLoadComplete(false);
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
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
