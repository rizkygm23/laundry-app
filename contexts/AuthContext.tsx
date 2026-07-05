'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check existing session
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const emailLower = email.toLowerCase().trim();
      const { data: userRow, error } = await supabase
        .from('users_laundry')
        .select('id, name, email, username, nomor_hp, alamat, password')
        .eq('email', emailLower)
        .maybeSingle();

      if (error) {
        return { error: new Error(error.message) };
      }

      if (!userRow) {
        return { error: new Error('Email atau password salah') };
      }

      if (userRow.password !== password) {
        return { error: new Error('Email atau password salah') };
      }

      const userData: AuthUser = {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        username: userRow.username,
        nomor_hp: userRow.nomor_hp ?? undefined,
        alamat: userRow.alamat ?? undefined,
      };

      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Login gagal') };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const emailLower = email.toLowerCase().trim();
      const username = emailLower.split('@')[0];

      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users_laundry')
        .select('id')
        .eq('email', emailLower)
        .maybeSingle();

      if (checkError) {
        return { error: new Error(checkError.message) };
      }

      if (existingUser) {
        return { error: new Error('Email sudah terdaftar') };
      }

      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from('users_laundry')
        .insert([
          {
            name: name.trim(),
            email: emailLower,
            username,
            password: password, // plain text
          },
        ])
        .select('id, name, email, username, nomor_hp, alamat')
        .single();

      if (insertError || !newUser) {
        return { error: new Error(insertError?.message || 'Gagal membuat akun') };
      }

      const userData: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        nomor_hp: newUser.nomor_hp ?? undefined,
        alamat: newUser.alamat ?? undefined,
      };

      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Registrasi gagal') };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('auth_user');
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
