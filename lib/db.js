import { Pool } from "pg"

let pool

// Use SSL only in production
const sslConfig =
  process.env.NODE_ENV === "production"
    ? {
        ssl: {
          rejectUnauthorized: false, // You might want to be more strict in a real production environment
        },
      }
    : {}

if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...sslConfig, // Spread the SSL config here
  })
}

export const db = pool
