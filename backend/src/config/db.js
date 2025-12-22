import pg from "pg";
import { Pool } from "pg";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

export const connectDB = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    await pool.connect();
    console.log("Database is connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
