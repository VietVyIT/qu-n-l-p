const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for many managed DBs like Neon/Supabase
  }
});

const initDB = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS work_days (
      mssv VARCHAR(50) PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      department VARCHAR(255),
      work_days NUMERIC,
      notes TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Database table "work_days" initialized successfully.');
  } catch (error) {
    console.error('Error initializing database. Please check DATABASE_URL:', error.message);
  }
};

module.exports = {
  pool,
  initDB
};
