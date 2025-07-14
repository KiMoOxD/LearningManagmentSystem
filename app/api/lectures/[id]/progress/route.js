import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const user = await verifyToken(req);
        if (!user || user.role !== 'student') {
            return NextResponse.json({ message: 'Only students can update progress' }, { status: 403 });
        }

        const { id: lectureId } = params;
        const { is_completed } = await req.json();

        if (is_completed) {
            // Add progress record
            const query = `
                INSERT INTO lecture_progress (student_id, lecture_id, completed_at)
                VALUES ($1, $2, CURRENT_TIMESTAMP)
                ON CONFLICT (student_id, lecture_id)
                DO NOTHING;
            `;
            await db.query(query, [user.id, lectureId]);
        } else {
            // Remove progress record
            const query = `
                DELETE FROM lecture_progress
                WHERE student_id = $1 AND lecture_id = $2;
            `;
            await db.query(query, [user.id, lectureId]);
        }

        return NextResponse.json({ message: 'Progress updated successfully' });

    } catch (error) {
        console.error(`POST /api/lectures/${params.id}/progress error:`, error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
} 