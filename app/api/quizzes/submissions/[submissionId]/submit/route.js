import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@/lib/auth';

export async function POST(req, { params }) {
    const { submissionId } = params;
    try {
        const user = await getAuth(req);
        if (!user || user.role !== 'student') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { rows: submissionRows } = await db.query(
            'SELECT * FROM quiz_submissions WHERE id = $1 AND student_id = $2',
            [submissionId, user.id]
        );
        const submission = submissionRows[0];

        if (!submission || submission.submitted_at) {
            return new NextResponse('Invalid submission or already submitted.', { status: 400 });
        }
        
        const body = await req.json();
        const { answers } = body; // answers should be an array of { question_id, answer_text, selected_option_id }

        const { rows: questions } = await db.query(
            `SELECT q.id, q.question_type, q.points, qo.id as correct_option_id, qo.option_text as correct_answer_text
             FROM questions q
             LEFT JOIN question_options qo ON q.id = qo.question_id AND qo.is_correct = TRUE
             WHERE q.quiz_id = $1`,
            [submission.quiz_id]
        );

        let score = 0;
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            for (const question of questions) {
                const studentAnswer = answers.find(a => a.question_id === question.id);
                let is_correct = false;

                if (studentAnswer) {
                    if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
                        is_correct = studentAnswer.selected_option_id === question.correct_option_id;
                    } else if (question.question_type === 'short_answer') {
                        // Simple case-insensitive comparison for short answers
                        is_correct = studentAnswer.answer_text?.toLowerCase() === question.correct_answer_text?.toLowerCase();
                    }

                    if (is_correct) {
                        score += question.points;
                    }

                    await client.query(
                        `INSERT INTO student_answers (submission_id, question_id, answer_text, selected_option_id, is_correct)
                         VALUES ($1, $2, $3, $4, $5)`,
                         [submissionId, question.id, studentAnswer.answer_text, studentAnswer.selected_option_id, is_correct]
                    );
                }
            }
            
            await client.query(
                'UPDATE quiz_submissions SET score = $1, submitted_at = NOW() WHERE id = $2',
                [score, submissionId]
            );

            await client.query('COMMIT');
            
            return NextResponse.json({ score });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error(`[SUBMISSION_SUBMIT_POST]`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 