import { Pool } from 'pg';

let pool;

if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Set ssl to false to disable it
    ssl: false,
  });
}

export const db = pool;