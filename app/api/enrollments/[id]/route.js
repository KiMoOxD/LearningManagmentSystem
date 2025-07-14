import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function DELETE(req, { params }) {
  try {
    const user = await verifyToken(req)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    const enrollmentId = params.id

    const result = await db.query("DELETE FROM course_enrollments WHERE id = $1 RETURNING *", [enrollmentId])

    if (result.rowCount === 0) {
        return NextResponse.json({ success: false, error: "Enrollment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Enrollment removed successfully" })
  } catch (error) {
    console.error(`DELETE /api/enrollments/[id] error:`, error)
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 })
  }
} 