const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// DB config
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "social_feed",
  password: "1234567", // your actual password
  port: 5432,
});

// Health check
router.get("/", (req, res) => {
  res.send("🔐 Auth route is active.");
});

// Register route
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📥 Registering:", email);

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
      [email, hashedPassword]
    );

    const userId = result.rows[0]?.id;
    const token = jwt.sign({ userId, email }, "secret", { expiresIn: "1h" });

    res.status(201).json({ message: "User created", token });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📥 Login attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const result = await pool.query(
      "SELECT id, password FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log("❌ No such user");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email }, "secret", {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
