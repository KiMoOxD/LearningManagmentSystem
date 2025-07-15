import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { db } from "./db"

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

export async function getAuth(req) {
  try {
    const decodedToken = await verifyToken(req);
    if (!decodedToken || !decodedToken.id) {
      return null;
    }

    const { rows } = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [decodedToken.id]);
    
    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    // verifyToken throws an error for invalid/missing tokens, so we can just return null
    return null;
  }
} 