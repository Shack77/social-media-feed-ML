const pool = require("./db");

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`;

pool.query(createUsersTable)
  .then(() => {
    console.log("✅ users table created");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Error creating users table:", err);
    process.exit(1);
  });
