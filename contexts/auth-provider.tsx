// contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Define your Profile type
interface Profile {
  id: string;
  username: string;
}

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  Profile | null | undefined;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [loading, setLoading] = useState(true); // Always start loading

  // This useEffect handles ONLY the authentication state.
  useEffect(() => {
    // onAuthStateChange fires immediately with the current session,
    // so we don't need a separate getSession() call. This is the key.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // The moment we know the session, we are no longer loading the auth state.
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // The empty array ensures this runs only ONCE.

  // This SECOND useEffect handles fetching the profile.
  // It runs only when the session changes.
  useEffect(() => {
    const user = session?.user;
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setProfile(data);
        });
    } else {
      // Clear profile when user logs out
      setProfile(null);
    }
  }, [session]); // This hook depends only on the session.

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
