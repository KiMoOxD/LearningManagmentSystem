import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(req, { params }) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const result = await db.query("SELECT * FROM courses WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }
    
    // Authorization check for students
    if (user.role === "student") {
      const enrollmentCheck = await db.query(
        "SELECT 1 FROM course_enrollments WHERE course_id = $1 AND student_id = $2",
        [id, user.id]
      )
      if (enrollmentCheck.rows.length === 0) {
        return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
      }
    }

    return NextResponse.json({ success: true, course: result.rows[0] })
  } catch (error) {
    console.error(`GET /api/courses/[id] error:`, error)
    if (error.message === "Unauthorized") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const user = await verifyToken(req)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ success: false, error: "Only teachers can edit courses" }, { status: 403 })
    }

    const { id } = params
    const { title, description } = await req.json()

    if (!title || title.length > 255) {
      return NextResponse.json({ success: false, error: "Invalid title" }, { status: 400 })
    }

    const result = await db.query(
      "UPDATE courses SET title = $1, description = $2 WHERE id = $3 RETURNING *",
      [title, description, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, course: result.rows[0] })
  } catch (error) {
    console.error("PUT /api/courses/[id] error:", error)
        if (error.message === "Unauthorized") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 })
  }
} 