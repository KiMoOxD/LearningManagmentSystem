import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req, { params }) {
  const { id: quizId } = params;
  try {
    const { rows: questions } = await db.query(
      `SELECT * FROM questions WHERE quiz_id = $1 ORDER BY "order" ASC`,
      [quizId]
    );

    // Also fetch options for each question
    for (const question of questions) {
        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
            const { rows: options } = await db.query(
                `SELECT * FROM question_options WHERE question_id = $1`,
                [question.id]
            );
            question.options = options;
        }
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error(`[QUESTIONS_GET]`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { id: quizId } = params;
  try {
    const body = await req.json();
    const { question_text, question_type, image_url, points, order, options } = body;

    // Basic validation
    if (!question_text || !question_type) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const { rows: newQuestion } = await client.query(
            `INSERT INTO questions (quiz_id, question_text, question_type, image_url, points, "order")
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [quizId, question_text, question_type, image_url, points, order]
        );
        const questionId = newQuestion[0].id;

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


        return new NextResponse(JSON.stringify(questionWithOptions), { status: 201 });

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

  } catch (error) {
    console.error(`[QUESTIONS_POST]`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 