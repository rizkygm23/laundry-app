'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        // Email verification disabled - users can login immediately after registration
        // Make sure to disable "Enable email confirmations" in Supabase Dashboard
      },
    });

    if (!error && data.user) {
      try {
        // Create user profile in users table
        // Note: Password field is not needed when using Supabase Auth
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: data.user.id,
            email: email,
            name: name,
            username: email.split('@')[0], // Use email prefix as username
            password: '', // Not used when using Supabase Auth
          },
        ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't fail registration if profile creation fails
        }
      } catch (err) {
        console.error('Error creating user profile:', err);
        // Don't fail registration if profile creation fails
      }

      // If session is available (email confirmation disabled), auto-login
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
    }

    return { error, data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
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

