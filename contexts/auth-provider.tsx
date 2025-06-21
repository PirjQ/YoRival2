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
    // onAuthStateChange is smart. It fires immediately with the current session.
    // We do not need a separate getSession() call. This was the source of all race conditions.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        // We wrap the profile fetch in a try...finally block.
        // This makes our state update "atomic" and resilient to errors.
        try {
          if (currentUser) {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            
            if (error && error.code !== 'PGRST116') {
              console.error("Error fetching profile inside listener:", error);
            }
            setProfile(profileData || null);
          } else {
            // If there is no user, there is no profile.
            setProfile(null);
          }
        } catch (error) {
            console.error("A catastrophic error occurred during profile fetch:", error);
            setProfile(null);
        } finally {
          // THIS IS THE MOST IMPORTANT LINE IN THE ENTIRE APP.
          // It GUARANTEES that loading becomes false, even if the profile
          // fetch fails, times out, or throws an error.
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // The empty array ensures this runs only once.

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
