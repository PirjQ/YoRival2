// hooks/use-auth.ts

import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Keep your Profile interface
export interface Profile {
  id: string;
  username: string;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true); // Start as true

  const fetchProfile = useCallback(async (user: User | null) => {
    // If there's no user, there's no profile to fetch.
    if (!user) {
      setProfile(null);
      return;
    }
    
    try {
      // Fetch the profile for the given user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(); // .single() is better if you expect exactly one row

      if (error) {
        // It's okay if a profile doesn't exist yet, don't log that as an error.
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Catastrophic error fetching profile:', error);
      setProfile(null);
    }
  }, []);

  // This is the ONLY useEffect needed. It runs once and sets up the listener.
  useEffect(() => {
    // This function runs immediately to get the initial session state.
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      await fetchProfile(session?.user ?? null);
      setLoading(false); // We are done with the initial load.
    };

    getInitialSession();

    // This listener reacts to all future auth changes (SIGN_IN, SIGN_OUT, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        // We always re-fetch the profile when the auth state changes.
        await fetchProfile(session?.user ?? null);
        // We don't need to manage loading state here, as the initial load is done.
      }
    );

    // This cleanup function runs when the component unmounts.
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]); // Dependency array ensures fetchProfile is available.

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle setting session and profile to null.
  }, []);

  // We return the user from the session for convenience.
  const user = session?.user ?? null;

  return { user, profile, session, loading, signOut };
}