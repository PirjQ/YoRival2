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

  // This one useEffect handles EVERYTHING.
  useEffect(() => {
    // onAuthStateChange fires immediately. This is our only source of truth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        // We wrap the profile fetch in a try...finally block.
        // This GUARANTEES that loading is set to false, no matter what.
        try {
          if (currentUser) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            setProfile(profileData || null);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching profile inside listener:", error);
          setProfile(null);
        } finally {
          // This will run whether the profile fetch succeeded or failed.
          // This is the key to never getting stuck.
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty array ensures this runs only once.

  const refreshProfile = useCallback(async () => {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
