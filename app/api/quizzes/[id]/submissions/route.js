import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@/lib/auth'; // Assuming an auth utility to get the logged-in user

export async function POST(req, { params }) {
    const { id: quizId } = params;
    try {
        const user = await getAuth(req);
        if (!user || user.role !== 'student') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check if a submission already exists for this user and quiz
        const { rows: existingSubmission } = await db.query(
            'SELECT id FROM quiz_submissions WHERE quiz_id = $1 AND student_id = $2',
            [quizId, user.id]
        );

        if (existingSubmission.length > 0) {
            // Depending on the rules, you might want to return the existing submission
            // or prevent a new one. For now, we'll return the existing one.
            return NextResponse.json(existingSubmission[0]);
        }
        
        const { rows: newSubmission } = await db.query(
            'INSERT INTO quiz_submissions (quiz_id, student_id, started_at) VALUES ($1, $2, NOW()) RETURNING *',
            [quizId, user.id]
        );

        return new NextResponse(JSON.stringify(newSubmission[0]), { status: 201 });

    } catch (error) {
        console.error(`[SUBMISSIONS_POST]`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function GET(req, { params }) {
    const { id: quizId } = params;
    try {
        const user = await getAuth(req);
        if (!user || user.role !== 'teacher') {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        
        // First, calculate the total possible score for the quiz
        const { rows: questions } = await db.query('SELECT points FROM questions WHERE quiz_id = $1', [quizId]);
        const totalPossibleScore = questions.reduce((total, q) => total + (q.points || 0), 0);

        const { rows: submissions } = await db.query(
            `SELECT 
                qs.id, 
                qs.student_id, 
                u.name as student_name, 
                u.email as student_email,
                qs.score, 
                qs.started_at, 
                qs.submitted_at
             FROM quiz_submissions qs
             JOIN users u ON qs.student_id = u.id
             WHERE qs.quiz_id = $1
             ORDER BY qs.submitted_at DESC`,
            [quizId]
        );

        return NextResponse.json({ submissions, totalPossibleScore });

    } catch (error) {
        console.error(`[SUBMISSIONS_GET]`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 