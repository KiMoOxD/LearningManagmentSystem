import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyToken(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const result = await db.query('SELECT * FROM lectures WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ message: 'Lecture not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`GET /api/lectures/${params.id} error:`, error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
  try {
    const user = await verifyToken(req);
    if (user?.role !== 'teacher') {
      return NextResponse.json({ message: 'Only teachers can update lectures' }, { status: 403 });
    }

    const { id } = params;
    const { title, description, module, content_url, is_published } = await req.json();

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const result = await db.query(
      `UPDATE lectures
       SET title = $1, description = $2, module = $3, content_url = $4, is_published = $5
       WHERE id = $6
       RETURNING *`,
      [title, description, module, content_url, is_published, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Lecture not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(`PUT /api/lectures/${params.id} error:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await verifyToken(req);
    if (user?.role !== 'teacher') {
      return NextResponse.json({ message: 'Only teachers can delete lectures' }, { status: 403 });
    }

    const { id } = params;
    
    await db.query('DELETE FROM lecture_completions WHERE lecture_id = $1', [id]);

    const result = await db.query('DELETE FROM lectures WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Lecture not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/lectures/${params.id} error:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 