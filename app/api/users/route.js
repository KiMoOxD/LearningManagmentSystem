import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import bcrypt from 'bcrypt';

export async function GET(req) {
  try {
    const user = await verifyToken(req);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ message: 'Only teachers can view students' }, { status: 403 });
    }

    const students = await db.query("SELECT id, name, email, role FROM users WHERE role = 'student'");
    return NextResponse.json(students.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await verifyToken(req);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ message: 'Only teachers can create students' }, { status: 403 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'student']
    );

    return NextResponse.json(newUser.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 