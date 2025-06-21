// contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface Profile {
  id: string;
  username: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // This is the only useEffect. It runs once.
  useEffect(() => {
    // This function fetches the profile. It is only called when we have a user.
    const fetchProfile = async (user: User) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Profile fetch error:", error);
      }
      setProfile(data || null);
    };

    // onAuthStateChange is the single source of truth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        if (currentUser) {
          // If we have a user, fetch their profile.
          await fetchProfile(currentUser);
        } else {
          // If there's no user, there's no profile.
          setProfile(null);
        }
        
        // This is the most important line. It runs at the end of every event.
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // The empty array guarantees this runs only once.

  const refreshProfile = async () => {
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data || null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { user, profile, loading, signOut, refreshProfile };

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
