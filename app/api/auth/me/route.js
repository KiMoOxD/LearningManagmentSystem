import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function GET(req) {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET)
    // You might want to fetch the user from DB to ensure they still exist and are active
    // For now, we'll trust the decoded token
    return NextResponse.json({
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    })
  } catch (error) {
    console.error("JWT verification error:", error)
    // Clear the invalid cookie
    cookieStore.set("auth_token", "", { maxAge: -1, path: "/" })
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
} 