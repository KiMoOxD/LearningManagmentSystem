import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    const { id: quizId } = params;
    try {
        const user = await getAuth(req);
        if (!user || user.role !== 'student') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Find the submission for this user and quiz
        const { rows: submissionRows } = await db.query(
            'SELECT * FROM quiz_submissions WHERE quiz_id = $1 AND student_id = $2',
            [quizId, user.id]
        );
        const submission = submissionRows[0];

        if (!submission || !submission.submitted_at) {
            return new NextResponse('Submission not found or not yet completed.', { status: 404 });
        }

        const submissionId = submission.id;
        
        // Get the quiz title
        const { rows: quizRows } = await db.query('SELECT title FROM quizzes WHERE id = $1', [submission.quiz_id]);

        // Get all questions, their options, and the student's answer for this submission
        const { rows: questions } = await db.query(`
            SELECT 
                q.id, 
                q.question_text, 
                q.question_type, 
                q.points,
                sa.answer_text, 
                sa.selected_option_id, 
                sa.is_correct
            FROM questions q
            LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.submission_id = $1
            WHERE q.quiz_id = $2
            ORDER BY q."order" ASC
        `, [submissionId, submission.quiz_id]);

        // For each question, get all options and identify the correct one
        for(const question of questions) {
            const { rows: options } = await db.query(
                'SELECT id, option_text, is_correct FROM question_options WHERE question_id = $1',
                [question.id]
            );
            question.options = options;
        }

        const totalPossibleScore = questions.reduce((total, q) => total + (q.points || 0), 0);

        const result = {
            quizTitle: quizRows[0]?.title,
            score: submission.score,
            totalPossibleScore,
            submittedAt: submission.submitted_at,
            questions,
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error(`[MY_RESULTS_GET]`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 