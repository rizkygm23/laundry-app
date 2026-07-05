import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';

const AUTH_SECRET = process.env.AUTH_SECRET;

export async function GET() {
  try {
    if (!AUTH_SECRET) {
      return NextResponse.json(
        { error: 'Server auth secret is not configured' },
        { status: 500 }
      );
    }

    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const session = verifySession(token, AUTH_SECRET);

    if (!session) {
      // Clear invalid cookie
      cookieStore.set(AUTH_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
