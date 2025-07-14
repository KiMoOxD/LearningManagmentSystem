import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(req) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    let courses
    if (user.role === "teacher") {
      const result = await db.query(
        "SELECT c.*, (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) as student_count FROM courses c ORDER BY id"
      )
      courses = result.rows
    } else {
      const result = await db.query(
        `SELECT c.*, 
        (SELECT COUNT(*) FROM lecture_progress lp WHERE lp.lecture_id IN (SELECT id FROM lectures WHERE course_id = c.id) AND lp.student_id = $1 AND lp.completed_at IS NOT NULL) as completed_lectures,
        (SELECT COUNT(*) FROM lectures l WHERE l.course_id = c.id AND l.is_published = true) as total_lectures
        FROM courses c 
        JOIN course_enrollments ce ON c.id = ce.course_id 
        WHERE ce.student_id = $1 
        ORDER BY c.id`,
        [user.id]
      )
      courses = result.rows.map(c => ({
        ...c,
        progress: c.total_lectures > 0 ? Math.round((c.completed_lectures / c.total_lectures) * 100) : 0
      }))
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/courses error:", error)
    if (error.message === "Unauthorized") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 })
  }
} 