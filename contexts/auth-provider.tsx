// contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Define the possible states of our authentication flow
type AuthStatus = 'initializing' | 'unauthenticated' | 'authenticated_no_profile' | 'authenticated_with_profile';

interface Profile {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  status: AuthStatus; // We use a status string instead of a boolean
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('initializing');

  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  }, []);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (!session?.user) {
          // If there's no user, the state is clear.
          setProfile(null);
          setStatus('unauthenticated');
          return;
        }

        // If there is a user, fetch their profile.
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profileData);

        // NOW we can determine the final, correct state.
        if (profileData) {
          setStatus('authenticated_with_profile');
        } else {
          setStatus('authenticated_no_profile');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    status,
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
