const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "social_feed",
  password: "1234567", // <-- change this
  port: 5432,
});


async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DB Time:", result.rows[0]);
  } catch (error) {
    console.error("DB Connection Failed:", error.message);
  }
}

testConnection();
=======
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "social_feed",
  password: "1234567", // <-- change this
  port: 5432,
});


async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DB Time:", result.rows[0]);
  } catch (error) {
    console.error("DB Connection Failed:", error.message);
  }
}

testConnection();
