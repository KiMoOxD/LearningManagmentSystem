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

        // First, get quiz details
        const { rows: quizRows } = await db.query(
            `SELECT id, title, description, time_limit FROM quizzes WHERE id = $1 AND is_published = TRUE`,
            [quizId]
        );
        const quiz = quizRows[0];

        if (!quiz) {
            return new NextResponse('Quiz not found or not published', { status: 404 });
        }

        // Then, get questions for the quiz
        const { rows: questions } = await db.query(
            `SELECT id, question_text, question_type, image_url, points, "order" 
             FROM questions 
             WHERE quiz_id = $1 
             ORDER BY "order" ASC`,
            [quizId]
        );
        
        // For each question, get its options, but exclude the is_correct field
        for (const question of questions) {
            if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
                const { rows: options } = await db.query(
                    `SELECT id, option_text FROM question_options WHERE question_id = $1`,
                    [question.id]
                );
                question.options = options;
            }
        }

        quiz.questions = questions;

        // Check if the student is enrolled in the course for this quiz
        const { rows: enrollmentRows } = await db.query(
            'SELECT * FROM course_enrollments WHERE course_id = (SELECT course_id FROM quizzes WHERE id = $1) AND student_id = $2',
            [quizId, user.id]
        );

        if (enrollmentRows.length === 0) {
            return new NextResponse('You are not enrolled in the course for this quiz.', { status: 403 });
        }

        // Also, start a submission if one doesn't exist, or get the existing one
        let { rows: submissionRows } = await db.query(
            'SELECT * FROM quiz_submissions WHERE quiz_id = $1 AND student_id = $2',
            [quizId, user.id]
        );

        if (submissionRows.length === 0) {
             const { rows: newSubmission } = await db.query(
                'INSERT INTO quiz_submissions (quiz_id, student_id, started_at) VALUES ($1, $2, NOW()) RETURNING *',
                [quizId, user.id]
            );
            submissionRows = newSubmission;
        }

        if (submissionRows[0].submitted_at) {
            return new NextResponse('You have already completed this quiz.', { status: 403 });
        }

        quiz.submission = submissionRows[0];

        return NextResponse.json(quiz);

    } catch (error) {
        console.error(`[QUIZ_TAKE_GET]`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 