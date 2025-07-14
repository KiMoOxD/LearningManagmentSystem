import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function PUT(req, { params }) {
  try {
    const unauthorizedResponse = await verifyToken(req);
    if (unauthorizedResponse) {
      const user = unauthorizedResponse.user;
      if (user.role !== 'teacher') {
        return NextResponse.json({ message: 'Only teachers can update students' }, { status: 403 });
      }
    } else {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const { name, email, password } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }

    const existingUser = await db.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, id]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: 'Email is already in use by another user' }, { status: 409 });
    }

    let query;
    let queryParams;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 AND role = \'student\' RETURNING id, name, email, role';
      queryParams = [name, email, hashedPassword, id];
    } else {
      query = 'UPDATE users SET name = $1, email = $2 WHERE id = $3 AND role = \'student\' RETURNING id, name, email, role';
      queryParams = [name, email, id];
    }

    const updatedUser = await db.query(query, queryParams);

    if (updatedUser.rows.length === 0) {
      return NextResponse.json({ message: 'Student not found or you cannot update this user' }, { status: 404 });
    }

    return NextResponse.json(updatedUser.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const unauthorizedResponse = await verifyToken(req);
    if (unauthorizedResponse) {
        const user = unauthorizedResponse.user;
        if (user.role !== 'teacher') {
            return NextResponse.json({ message: 'Only teachers can delete students' }, { status: 403 });
        }
    } else {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;

    await db.query('DELETE FROM enrollments WHERE user_id = $1', [id]);
    await db.query('DELETE FROM lecture_completions WHERE user_id = $1', [id]);

    const result = await db.query('DELETE FROM users WHERE id = $1 AND role = \'student\'', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 