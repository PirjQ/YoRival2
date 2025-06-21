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
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // This one useEffect handles EVERYTHING. It is the single source of truth.
  useEffect(() => {
    // onAuthStateChange fires immediately with the current session.
    // We do not need a separate getSession() call. This was the source of all race conditions.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        if (currentUser) {
          // If there is a user, fetch their profile.
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setProfile(profileData || null);
        } else {
          // If there is no user, there is no profile.
          setProfile(null);
        }
        
        // THIS IS THE MOST IMPORTANT LINE.
        // It only runs after BOTH the session AND the profile have been checked.
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // The empty dependency array ensures this runs only once.

  const refreshProfile = useCallback(async () => {
    // This function can be called by ProfileSetup to force a re-check
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data || null);
    }
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
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
