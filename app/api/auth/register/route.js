import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    // Input validation
    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    if (role !== 'teacher' && role !== 'student') {
      return NextResponse.json({ success: false, error: "Role must be 'teacher' or 'student'" }, { status: 400 });
    }

    // Check for existing user
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Enforce single teacher rule
    if (role === 'teacher') {
      const teacherExists = await db.query("SELECT * FROM users WHERE role = 'teacher'");
      if (teacherExists.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'A teacher account has already been registered.' }, { status: 403 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    return NextResponse.json({ success: true, user: newUser.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
