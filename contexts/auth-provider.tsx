// contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// The possible states of our authentication flow
type AuthStatus = 'initializing' | 'unauthenticated' | 'authenticated_needs_profile' | 'authenticated_ready';

// The shape of your Profile data
interface Profile {
  id: string;
  username: string;
}

// The shape of the context value provided to components
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  status: AuthStatus;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('initializing');

  const refreshProfile = useCallback(async () => {
    // This function can be called by other components to force a profile re-check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Should not happen if called correctly, but safe
    
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);

    // After refreshing, we can re-evaluate the status
    if (data) {
      setStatus('authenticated_ready');
    } else {
      setStatus('authenticated_needs_profile');
    }
  }, []);

  useEffect(() => {
    // This is the single, unified listener for all auth events.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        if (!currentUser) {
          // If no user, the state is clear and final.
          setProfile(null);
          setStatus('unauthenticated');
          return;
        }

        // If there is a user, we must check for their profile.
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        setProfile(profileData);

        // NOW we can determine the final, correct status.
        if (profileData) {
          setStatus('authenticated_ready');
        } else {
          setStatus('authenticated_needs_profile');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = { user, profile, status, signOut, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
