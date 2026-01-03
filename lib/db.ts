import "server-only";

import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Check PostgreSQL Status
(async () => {
  try {
    await pool.connect();
  } catch (err) {
    console.error("[ERROR] Failed to connect to Postgres", err);
    process.exit(1);
  }
})();

pool.on("error", (err) => {
  console.log("[ERROR] database error", err);
});

// eslint-disable-next-line
export const query = (query: string, params?: any[]) =>
  pool.query(query, params);
