import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function setupDb() {
  console.log("[INFO] Start Setup Database");

  try {
    console.log("[INFO] Run BETTER-AUTH Migration");
    execSync("npx @better-auth/cli migrate", { stdio: "inherit" });
    console.log("[INFO] BETTER-AUTH Migration Succeded");

    console.log("[INFO] Create App Required Tables");
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const initSqlFile = fs.readFileSync(
      path.join("__direname", "../database/init.sql"),
      "utf8",
    );

    await pool.query(initSqlFile);
    console.log("[INFO] Tables Created");

    await pool.end();
  } catch (error) {
    console.log(`[ERROR] ${error}`);
    process.exit(1);
  }
}

setupDb();
