import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(req) {
  try {
    const user = await verifyToken(req)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ success: false, error: "Only teachers can create lectures" }, { status: 403 })
    }

    const { course_id, title, description, content_url, is_published, module } = await req.json()

    if (!course_id || !title) {
      return NextResponse.json({ success: false, error: "Course ID and title are required" }, { status: 400 })
    }

    // Verify course exists
    const courseCheck = await db.query("SELECT id FROM courses WHERE id = $1", [course_id])
    if (courseCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    const result = await db.query(
      `INSERT INTO lectures (course_id, title, description, content_url, is_published, module) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [course_id, title, description, content_url, is_published, module]
    )

    return NextResponse.json({ success: true, lecture: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("POST /api/lectures error:", error)
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("course_id")

    if (!courseId) {
      return NextResponse.json({ success: false, error: "Course ID is required" }, { status: 400 })
    }

    let lectures
    if (user.role === "teacher") {
      const result = await db.query("SELECT * FROM lectures WHERE course_id = $1 ORDER BY module, created_at", [courseId])
      lectures = result.rows
    } else { // student
      const enrollmentCheck = await db.query("SELECT 1 FROM course_enrollments WHERE course_id = $1 AND student_id = $2", [courseId, user.id])
      if (enrollmentCheck.rows.length === 0) {
        return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
      }
      const result = await db.query(
        `SELECT l.*, lp.completed_at IS NOT NULL as is_completed 
         FROM lectures l 
         LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.student_id = $2
         WHERE l.course_id = $1 AND l.is_published = true 
         ORDER BY l.module, l.created_at`,
        [courseId, user.id]
      )
      lectures = result.rows
    }

    return NextResponse.json({ success: true, lectures })
  } catch (error) {
    console.error("GET /api/lectures error:", error)
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 })
  }
} 