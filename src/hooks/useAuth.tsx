import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    // Hoist subscription ref outside the async function so the useEffect
    // cleanup can reliably unsubscribe regardless of when initAuth resolves.
    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;

    async function initAuth() {
      try {
        console.log('[AuthProvider] Initializing auth...');

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AuthProvider] Initial session:', {
          user: session?.user?.id,
          email: session?.user?.email,
          hasSession: !!session,
        });

        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('[AuthProvider] Fetching profile for user:', session.user.id);
          await fetchProfile(session.user.id);
        } else {
          console.log('[AuthProvider] No session, setting loading to false');
          setLoading(false);
        }

        // Listen for auth changes
        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          console.log('[AuthProvider] Auth state changed:', {
            event: _event,
            user: session?.user?.id,
            email: session?.user?.email,
          });

          setUser(session?.user ?? null);
          if (session?.user) {
            console.log('[AuthProvider] Auth state change: fetching profile');
            await fetchProfile(session.user.id);
          } else {
            console.log('[AuthProvider] Auth state change: clearing profile');
            setProfile(null);
            setProfileLoading(false);
            setLoading(false);
          }
        });

        subscription = data.subscription;
      } catch (error) {
        console.error('[AuthProvider] Auth initialization error:', error);
        setLoading(false);
      }
    }

    initAuth();

    // Cleanup: unsubscribe when the component unmounts or effect re-runs.
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function fetchProfile(uid: string) {
    try {
      console.log('[AuthProvider.fetchProfile] Starting profile fetch for:', uid);
      setProfileLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        console.error('[AuthProvider.fetchProfile] Profile query error:', error);
        throw error;
      }

      console.log('[AuthProvider.fetchProfile] Profile fetched successfully:', {
        id: data?.id,
        email: data?.email,
        role: data?.role,
        full_name: data?.full_name,
      });

      setProfile(data);
    } catch (error) {
      console.error('[AuthProvider.fetchProfile] Error fetching profile:', error);
      // Profile fetch failed, but don't clear the user session
      // This is temporary - the user is still authenticated
    } finally {
      console.log('[AuthProvider.fetchProfile] Profile fetch completed');
      setProfileLoading(false);
      setLoading(false);
    }
  }

  const signOut = async () => {
    console.log('[AuthProvider] Signing out...');
    await supabase.auth.signOut();
    console.log('[AuthProvider] Sign out completed');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
