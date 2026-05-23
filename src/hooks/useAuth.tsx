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

  // Track the last fetched user ID to prevent duplicate fetches
  const lastFetchedUserRef = React.useRef<string | null>(null);
  const fetchInProgressRef = React.useRef(false);

  useEffect(() => {
    // Hoist subscription ref outside the async function so the useEffect
    // cleanup can reliably unsubscribe regardless of when initAuth resolves.
    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;
    let profileFetchTimeout: NodeJS.Timeout | null = null;

    async function initAuth() {
      try {
        if (import.meta.env.DEV) console.log('[AuthProvider] Initializing auth...');

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (import.meta.env.DEV) console.log('[AuthProvider] Initial session:', {
          user: session?.user?.id,
          email: session?.user?.email,
          hasSession: !!session,
        });

        setUser(session?.user ?? null);
        if (session?.user) {
          if (import.meta.env.DEV) console.log('[AuthProvider] Fetching profile for user:', session.user.id);
          await fetchProfile(session.user.id);
        } else {
          if (import.meta.env.DEV) console.log('[AuthProvider] No session, setting loading to false');
          setLoading(false);
        }

        // Listen for auth changes - only fetch if user ID actually changed
        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (import.meta.env.DEV) console.log('[AuthProvider] Auth state changed:', {
            event: _event,
            user: session?.user?.id,
            email: session?.user?.email,
          });

          setUser(session?.user ?? null);
          if (session?.user) {
            // Only fetch if this is a different user
            if (lastFetchedUserRef.current !== session.user.id) {
              if (import.meta.env.DEV) console.log('[AuthProvider] Auth state change: fetching profile');
              await fetchProfile(session.user.id);
            } else {
              if (import.meta.env.DEV) console.log('[AuthProvider] Auth state change: same user, skipping fetch');
            }
          } else {
            if (import.meta.env.DEV) console.log('[AuthProvider] Auth state change: clearing profile');
            setProfile(null);
            setProfileLoading(false);
            setLoading(false);
            lastFetchedUserRef.current = null;
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
      if (profileFetchTimeout) clearTimeout(profileFetchTimeout);
    };
  }, []);

  async function fetchProfile(uid: string) {
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      if (import.meta.env.DEV) console.log('[AuthProvider.fetchProfile] Fetch already in progress, skipping');
      return;
    }

    try {
      if (import.meta.env.DEV) console.log('[AuthProvider.fetchProfile] Starting profile fetch for:', uid);
      fetchInProgressRef.current = true;
      setProfileLoading(true);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('[AuthProvider.fetchProfile] Profile query error:', error);
        throw error;
      }

      if (import.meta.env.DEV) console.log('[AuthProvider.fetchProfile] Profile fetched successfully:', {
        id: data?.id,
        email: data?.email,
        role: data?.role,
        full_name: data?.full_name,
      });

      setProfile(data);
      lastFetchedUserRef.current = uid;
    } catch (error) {
      console.error('[AuthProvider.fetchProfile] Error fetching profile:', error);
      // Profile fetch failed, but don't clear the user session
      // This is temporary - the user is still authenticated
      // Don't update lastFetchedUserRef so we can retry later
    } finally {
      fetchInProgressRef.current = false;
      if (import.meta.env.DEV) console.log('[AuthProvider.fetchProfile] Profile fetch completed');
      setProfileLoading(false);
      setLoading(false);
    }
  }

  const signOut = async () => {
    if (import.meta.env.DEV) console.log('[AuthProvider] Signing out...');
    await supabase.auth.signOut();
    if (import.meta.env.DEV) console.log('[AuthProvider] Sign out completed');
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
