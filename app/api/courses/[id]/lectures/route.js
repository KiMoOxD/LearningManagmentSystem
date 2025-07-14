import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId } = params;
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('student_id');
    
    let query;
    let queryParams;

    if (user.role === 'student' || studentId) {
      const idForQuery = user.role === 'student' ? user.id : studentId;
      query = `
        SELECT l.*, (lp.completed_at IS NOT NULL) as is_completed
        FROM lectures l
        LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.student_id = $2
        WHERE l.course_id = $1 AND l.is_published = true
        ORDER BY l.module, l.created_at ASC
      `;
      queryParams = [courseId, idForQuery];
    } else { // Teacher viewing their own course lectures without specifying a student
      query = `
        SELECT * FROM lectures 
        WHERE course_id = $1 
        ORDER BY module, created_at ASC
      `;
      queryParams = [courseId];
    }

    const { rows } = await db.query(query, queryParams);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(`GET /api/courses/${params.id}/lectures error:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await verifyToken(req);
    if (user?.role !== 'teacher') {
      return NextResponse.json({ message: 'Only teachers can create lectures' }, { status: 403 });
    }

    const { id: courseId } = params;
    const { title, description, module, content_url, is_published } = await req.json();

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO lectures (course_id, title, description, module, content_url, is_published)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [courseId, title, description, module, content_url, is_published]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(`POST /api/courses/${params.id}/lectures error:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 