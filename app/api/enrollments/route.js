import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(req) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("course_id");
    const studentId = searchParams.get("student_id");

    if (courseId) {
      if (user.role === "student") {
        const enrollmentCheck = await db.query(
          "SELECT 1 FROM course_enrollments WHERE course_id = $1 AND student_id = $2",
          [courseId, user.id]
        );
        if (enrollmentCheck.rows.length === 0) {
          return NextResponse.json({ message: "Access denied" }, { status: 403 });
        }
      }
      const result = await db.query(
        `SELECT u.id, u.name, u.email, e.id as enrollment_id, e.course_id
         FROM users u 
         JOIN course_enrollments e ON u.id = e.student_id 
         WHERE e.course_id = $1`,
        [courseId]
      );
      return NextResponse.json(result.rows);
    } else if (studentId) {
      if (user.id.toString() !== studentId && user.role !== 'teacher') {
        return NextResponse.json({ message: "Access denied" }, { status: 403 });
      }
      const result = await db.query(
        `SELECT c.*, p.progress
         FROM courses c
         JOIN course_enrollments e ON c.id = e.course_id
         LEFT JOIN (
            SELECT l.course_id, (COUNT(CASE WHEN lp.completed_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(l.id)) as progress
            FROM lectures l
            LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.student_id = $1
            GROUP BY l.course_id
         ) p ON c.id = p.course_id
         WHERE e.student_id = $1`,
        [studentId]
      );
      return NextResponse.json(result.rows);
    } else {
      if (user.role !== 'teacher') {
        return NextResponse.json({ message: "Only teachers can view all enrollments" }, { status: 403 });
      }
      const result = await db.query('SELECT course_id, student_id FROM course_enrollments');
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error("GET /api/enrollments error:", error);
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await verifyToken(req)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ success: false, error: "Only teachers can enroll students" }, { status: 403 })
    }

    const { course_id, student_id } = await req.json()

    if (!course_id || !student_id) {
      return NextResponse.json({ success: false, error: "Course ID and Student ID are required" }, { status: 400 })
    }
    
    // Check if student exists and has student role
    const studentCheck = await db.query("SELECT id FROM users WHERE id = $1 AND role = 'student'", [student_id]);
    if (studentCheck.rows.length === 0) {
        return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    try {
        const result = await db.query(
          "INSERT INTO course_enrollments (course_id, student_id) VALUES ($1, $2) RETURNING *",
          [course_id, student_id]
        )
        return NextResponse.json({ success: true, enrollment: result.rows[0] }, { status: 201 })
    } catch (dbError) {
        if (dbError.code === '23505') { // unique_violation
            return NextResponse.json({ success: false, error: "Student already enrolled in this course" }, { status: 409 })
        }
        throw dbError;
    }

  } catch (error) {
    console.error("POST /api/enrollments error:", error)
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 })
  }
} 