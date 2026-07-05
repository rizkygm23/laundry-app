import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-server';
import {
  AUTH_COOKIE_NAME,
  AuthUser,
  createSessionPayload,
  hashPassword,
  signSession,
} from '@/lib/auth';

const AUTH_SECRET = process.env.AUTH_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!AUTH_SECRET) {
      return NextResponse.json(
        { error: 'Server auth secret is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const username = emailLower.split('@')[0];

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users_laundry')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json(
        { error: 'Terjadi kesalahan saat memeriksa user' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    // Hash password
    const { hash, salt } = hashPassword(password);

    // Insert user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users_laundry')
      .insert([
        {
          name: name.trim(),
          email: emailLower,
          username,
          password: hash,
          salt,
        },
      ])
      .select('id, name, email, username, nomor_hp, alamat')
      .single();

    if (insertError || !newUser) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { error: 'Gagal membuat akun' },
        { status: 500 }
      );
    }

    const user: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      username: newUser.username,
      nomor_hp: newUser.nomor_hp ?? undefined,
      alamat: newUser.alamat ?? undefined,
    };

    const session = createSessionPayload(user);
    const token = signSession(session, AUTH_SECRET);

    const cookieStore = cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
