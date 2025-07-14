import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function verifyToken(req) {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")

  if (!token) {
    throw new Error("Unauthorized")
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    throw new Error("Unauthorized")
  }
} 