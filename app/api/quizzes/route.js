import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getAuth(req);
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let quizzesQuery;
    const queryParams = [];

    if (user.role === 'teacher') {
      quizzesQuery = `
        SELECT q.*, c.title as course_title 
        FROM quizzes q 
        JOIN courses c ON q.course_id = c.id
        ORDER BY q.created_at DESC
      `;
    } else { // 'student'
      quizzesQuery = `
        SELECT q.*, c.title as course_title, qs.id as submission_id, qs.score, qs.submitted_at
        FROM quizzes q
        JOIN courses c ON q.course_id = c.id
        JOIN course_enrollments ce ON q.course_id = ce.course_id
        LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id AND qs.student_id = $1
        WHERE ce.student_id = $1 AND q.is_published = TRUE
        ORDER BY q.due_date ASC, q.created_at DESC
      `;
      queryParams.push(user.id);
    }
    
    const { rows: quizzes } = await db.query(quizzesQuery, queryParams);

    const quizzesWithStatus = quizzes.map(q => {
      let status = 'Not Started';
      if (q.submitted_at) {
        status = 'Completed';
      } else if (q.due_date && new Date(q.due_date) < new Date()) {
        status = 'Overdue';
      }
      
      // For teacher view
      if(user.role === 'teacher') {
        status = q.is_published ? 'Published' : 'Draft';
      }

      return {
        ...q,
        status,
        dueDate: q.due_date,
        createdDate: q.created_at,
      }
    });

    return NextResponse.json(quizzesWithStatus);
  } catch (error) {
    console.error('[QUIZZES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, course_id, description, time_limit, due_date, is_published } = body;

    if (!title || !course_id) {
        return new NextResponse('Missing required fields: title and course_id', { status: 400 });
    }

    const { rows: newQuiz } = await db.query(
      `INSERT INTO quizzes (title, course_id, description, time_limit, due_date, is_published)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, parseInt(course_id), description, time_limit, due_date, is_published]
    );

    return new NextResponse(JSON.stringify(newQuiz[0]), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[QUIZZES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 