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

// Define the shape of the context. This is what components will receive.
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean; // The single, reliable loading state for the initial auth check.
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use unambiguous state names to prevent shadowing.
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true); // Start in a loading state.

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error && error.code !== 'PGRST116') console.error("Profile fetch error:", error);
    setUserProfile(data);
  }, []);

  // This is the most important part. This useEffect runs ONLY ONCE when the app loads.
  useEffect(() => {
    // This function checks the initial session state on the client.
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setActiveSession(session);
      await fetchProfile(session?.user ?? null);
      setLoading(false); // Initial check is complete.
    };

    getInitialSession();

    // This listener handles all subsequent auth changes (SIGN_IN, SIGN_OUT, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setActiveSession(newSession);
        await fetchProfile(newSession?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  // The empty dependency array `[]` GUARANTEES this runs only once.
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = {
    session: activeSession,
    user: activeSession?.user ?? null,
    profile: userProfile,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// This is the hook your components will use.
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
