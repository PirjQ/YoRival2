// contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile { id: string; username: string; }
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

  console.log(`--- AuthProvider RENDER --- loading: ${loading}, user: ${!!user}, profile: ${!!profile}`);

  useEffect(() => {
    console.log("AuthProvider: Main useEffect runs ONCE.");

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`EVENT: ${event}. Session exists: ${!!session}`);
        
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        if (currentUser) {
          console.log(`  > User found (${currentUser.id}). Fetching profile...`);
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error("  > Profile fetch error:", error);
          }
          
          console.log("  > Profile data received:", profileData);
          setProfile(profileData || null);
        } else {
          console.log("  > No user. Clearing profile.");
          setProfile(null);
        }
        
        console.log("  > FINAL STEP: Setting loading to false.");
        setLoading(false);
      }
    );

    return () => {
      console.log("AuthProvider: Unsubscribing from auth changes.");
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    console.log("refreshProfile called.");
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data || null);
    }
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = { user, profile, loading, signOut, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
}
