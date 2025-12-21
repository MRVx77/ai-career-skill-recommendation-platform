import pg from "pg";
import { Pool } from "pg";

export const connectDB = async () => {
  const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "ai_career_platform",
    port: 5432,
  });

  try {
    await pool.connect();
    console.log("Database is connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
