import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req, { params }) {
    const { questionId } = params;
    try {
        const body = await req.json();
        const { question_text, question_type, image_url, points, order, options } = body;

        if (!question_text || !question_type) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const { rows: updatedQuestion } = await client.query(
                `UPDATE questions
                 SET question_text = $1, question_type = $2, image_url = $3, points = $4, "order" = $5
                 WHERE id = $6
                 RETURNING *`,
                [question_text, question_type, image_url, points, order, questionId]
            );

            if (updatedQuestion.length === 0) {
                return new NextResponse('Question not found', { status: 404 });
            }

            // For simplicity, we'll delete existing options and re-insert them.
            // A more complex implementation could diff the options.
            await client.query('DELETE FROM question_options WHERE question_id = $1', [questionId]);

            if ((question_type === 'multiple_choice' || question_type === 'true_false') && options && options.length > 0) {
                for (const option of options) {
                    await client.query(
                        `INSERT INTO question_options (question_id, option_text, is_correct)
                         VALUES ($1, $2, $3)`,
                        [questionId, option.option_text, option.is_correct]
                    );
                }
            }

            await client.query('COMMIT');

            // Re-fetch the newly created question with its options
            const { rows } = await client.query(
                `SELECT * FROM questions WHERE id = $1`,
                [questionId]
            );
            const questionWithOptions = rows[0];
            const { rows: questionOptions } = await client.query(
                `SELECT * FROM question_options WHERE question_id = $1`,
                [questionId]
            );
            questionWithOptions.options = questionOptions;

            return NextResponse.json(questionWithOptions);

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error(`[QUESTION_PUT]`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { questionId } = params;
    try {
        const result = await db.query('DELETE FROM questions WHERE id = $1 RETURNING id', [questionId]);

        if (result.rowCount === 0) {
            return new NextResponse('Question not found', { status: 404 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`[QUESTION_DELETE]`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 