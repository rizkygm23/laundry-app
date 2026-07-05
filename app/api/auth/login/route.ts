import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-server';
import {
  AUTH_COOKIE_NAME,
  AuthUser,
  createSessionPayload,
  signSession,
  verifyPassword,
} from '@/lib/auth';

const AUTH_SECRET = process.env.AUTH_SECRET || 'laundry-app-default-session-secret-key-12345';

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Find user by email
    const { data: userRow, error: findError } = await supabaseAdmin
      .from('users_laundry')
      .select('id, name, email, username, password, salt, nomor_hp, alamat')
      .eq('email', emailLower)
      .maybeSingle();

    if (findError) {
      console.error('Error finding user:', findError);
      return NextResponse.json(
        { error: 'Terjadi kesalahan saat login' },
        { status: 500 }
      );
    }

    if (!userRow) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = verifyPassword(password, userRow.salt, userRow.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const user: AuthUser = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      username: userRow.username,
      nomor_hp: userRow.nomor_hp ?? undefined,
      alamat: userRow.alamat ?? undefined,
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
