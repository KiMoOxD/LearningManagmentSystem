import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(req) {
  try {
    const user = await verifyToken(req)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ success: false, error: "Only teachers can upload files" }, { status: 403 })
    }

    const data = await req.formData()
    const file = data.get('file')

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }
    
    // For demonstration, we'll save it locally. 
    // In production, you'd upload to a cloud service (S3, etc.).
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // With the file data in the buffer, you can do whatever you want with it.
    // For this, we'll write it to the public directory.
    const filename = `${Date.now()}-${file.name}`
    const path = join(process.cwd(), 'public', 'uploads', filename)
    await writeFile(path, buffer)
    console.log(`open ${path} to see the uploaded file`)

    const content_url = `/uploads/${filename}`

    return NextResponse.json({ success: true, content_url })
  } catch (error) {
    console.error("POST /api/lectures/upload error:", error)
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 })
  }
} 