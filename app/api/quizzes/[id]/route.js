import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@/lib/auth';

// GET a single quiz
export async function GET(req, { params }) {
  try {
    const { id } = params;
    console.log(id);
    const quiz = await db.query('SELECT * FROM quizzes WHERE id = $1', [id]);

    if (quiz.rows.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quiz.rows[0]);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT (update) a quiz
export async function PUT(req, { params }) {
    const user = await getAuth(req);
    if (!user || user.role !== 'teacher') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id: quizId } = params;
        const { title, description, course_id, time_limit, due_date, is_published } = await req.json();

        if (!title || !course_id) {
            return NextResponse.json({ error: 'Title and course ID are required' }, { status: 400 });
        }

        const updatedQuiz = await db.query(
            `UPDATE quizzes 
             SET title = $1, description = $2, course_id = $3, time_limit = $4, due_date = $5, is_published = $6
             WHERE id = $7
             RETURNING *`,
            [title, description, course_id, time_limit, due_date, is_published, quizId]
        );

        if (updatedQuiz.rows.length === 0) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        return NextResponse.json(updatedQuiz.rows[0]);
    } catch (error) {
        console.error('Error updating quiz:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


// DELETE a quiz
export async function DELETE(req, { params }) {
    const user = await getAuth(req);
    if (!user || user.role !== 'teacher') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        const { id: quizId } = params;
        
        await db.query('DELETE FROM quizzes WHERE id = $1', [quizId]);

        return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
        console.error('Error deleting quiz:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 