import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the auth_token cookie
    cookies().set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      sameSite: 'strict',
      maxAge: 0,
    });

    return NextResponse.json({ success: true, message: 'You have been logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
