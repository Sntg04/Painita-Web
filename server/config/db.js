import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render/managed Postgres often requires SSL
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : undefined,
});
