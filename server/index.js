// index.js (Cleaned and Fixed Version)
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "social_feed",
  password: "1234567",
  port: 5432
});

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|mp4|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) cb(null, true);
    else cb(new Error("Only images, videos, and PDFs are allowed"));
  },
});


const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

const tokenBlacklist = new Set();
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  if (tokenBlacklist.has(token)) return res.sendStatus(403);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

app.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query("SELECT id, email, username FROM users WHERE id = $1", [req.user.id]);
    if (!userResult.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(userResult.rows[0]); // directly return user
  } catch (err) {
    console.error("Error fetching /auth/me user:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
});



app.post("/upload", async (req, res) => {
  const { text } = req.body;
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const uploadedFiles = req.files?.files;
    let filenames = [];

    if (uploadedFiles) {
      const filesArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];

      for (const file of filesArray) {
        if (!file.mimetype.startsWith("image/")) {
          return res.status(400).json({ error: "Only image files are allowed." });
        }

        if (file.size > 2 * 1024 * 1024) {
          return res.status(400).json({ error: "Each file must be under 2MB." });
        }

        const filename = `${Date.now()}_${file.name}`;
        await file.mv(path.join(uploadsDir, filename));
        filenames.push(`/uploads/${filename}`);
      }
    }

    // Save the first image URL 
    const result = await pool.query(
      "INSERT INTO posts (user_id, text, image_url) VALUES ($1, $2, $3) RETURNING *",
      [userId, text, filenames[0] || null]
    );

    const newPost = result.rows[0];
    io.emit("new_post", newPost);
    res.json({ success: true, post: newPost });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to save post" });
  }
});


app.get("/posts", async (req, res) => {
  try {
    const { username, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.username, COALESCE(l.like_count, 0) AS likes
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS like_count
        FROM likes
        GROUP BY post_id
      ) l ON p.id = l.post_id
    `;

    const params = [];

    if (username) {
      query += ` WHERE u.username = $1`;
      params.push(username);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const postsRes = await pool.query(query, params);

    const postIds = postsRes.rows.map(p => p.id);
    let commentMap = {};
    if (postIds.length > 0) {
      const commentRes = await pool.query(
        `SELECT c.post_id, c.content, c.created_at, u.username 
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ANY($1::int[])`,
        [postIds]
      );

      commentMap = commentRes.rows.reduce((acc, row) => {
        if (!acc[row.post_id]) acc[row.post_id] = [];
        acc[row.post_id].push({
          text: row.content,
          user: row.username,
          time: row.created_at,
        });
        return acc;
      }, {});
    }

    const finalPosts = postsRes.rows.map(post => ({
      ...post,
      image_url: (() => {
    try {
      return JSON.parse(post.image_url);
    } catch {
      return [post.image_url];
    }
  })(),
  comments: commentMap[post.id] || [],
      comments: commentMap[post.id] || []
    }));

    res.json(finalPosts);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const postId = req.params.id;

    const check = await pool.query("SELECT * FROM posts WHERE id = $1 AND user_id = $2", [postId, userId]);
    if (check.rowCount === 0) return res.status(403).json({ error: "Not authorized" });

    await pool.query("DELETE FROM posts WHERE id = $1", [postId]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

app.put("/posts/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  const decoded = jwt.verify(token, JWT_SECRET);
  const userId = decoded.id;

  const result = await pool.query("UPDATE posts SET text = $1 WHERE id = $2 AND user_id = $3 RETURNING *", [text, id, userId]);
  if (result.rowCount === 0) return res.sendStatus(403);
  res.json({ success: true, post: result.rows[0] });
});


app.post("/posts/:postId/like", async (req, res) => {
  const { postId } = req.params;
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Prevent duplicate like
    await pool.query(
      "INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT (user_id, post_id) DO NOTHING",
      [userId, postId]
    );

    const updatedLikes = await pool.query(
      "SELECT COUNT(*) FROM likes WHERE post_id = $1",
      [postId]
    );

    await pool.query("UPDATE posts SET likes = $1 WHERE id = $2", [
      updatedLikes.rows[0].count,
      postId
    ]);

    const updatedPost = await pool.query("SELECT * FROM posts WHERE id = $1", [postId]);

    io.emit("like_update", updatedPost.rows[0]);
    res.json({ success: true, post: updatedPost.rows[0] });

  } catch (err) {
    console.error("Failed to like post:", err);
    res.status(500).json({ error: "Failed to like post" });
  }
});

app.post("/posts/:id/comment", async (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    await pool.query(
      `INSERT INTO comments (user_id, post_id, content)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, post_id, content) DO NOTHING`,
      [userId, postId, text]
    );

    const commentResult = await pool.query(
  `SELECT content FROM comments WHERE post_id = $1 ORDER BY created_at ASC`,
  [postId]
);
const comments = commentResult.rows.map((c) => ({
  text: c.content,
  time: c.created_at
}));

    io.emit("new_comment", { postId: parseInt(postId), comment: text });
    return res.json({ success: true, comments });
  } catch (err) {
    console.error("Failed to add comment:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to add comment" });
    }
  }
});

app.get("/user/:username/posts", async (req, res) => {
  const { username } = req.params;
  try {
    const userResult = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (!userResult.rows.length) return res.status(404).json({ error: "User not found" });

    const userId = userResult.rows[0].id;

    const posts = await pool.query(
      `SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE u.id = $1 ORDER BY p.created_at DESC`,
      [userId]
    );

    const postIds = posts.rows.map((p) => p.id);
    let commentMap = {};

    if (postIds.length > 0) {
      const commentRes = await pool.query(
        `SELECT c.post_id, c.content, c.created_at, u.username 
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ANY($1::int[])`,
        [postIds]
      );

      commentMap = commentRes.rows.reduce((acc, row) => {
        if (!acc[row.post_id]) acc[row.post_id] = [];
        acc[row.post_id].push({
          text: row.content,
          user: row.username,
          time: row.created_at,
        });
        return acc;
      }, {});
    }

    const finalPosts = posts.rows.map((post) => ({
      ...post,
      image_url: (() => {
        try {
          return JSON.parse(post.image_url);
        } catch {
          return [post.image_url];
        }
      })(),
      comments: commentMap[post.id] || [],
    }));

    res.json(finalPosts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ error: "Failed to fetch user's posts" });
  }
});

app.get("/recommended-feed", async (req, res) => {
  try {
    const posts = await db.any(`-- use the SQL above`);
    res.json(posts);
  } catch (err) {
    console.error("Error fetching recommended feed:", err);
    res.status(500).json({ message: "Failed to fetch feed" });
  }
});


app.post("/auth/register", async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, username, password, email) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, username, hashed, email]
    );
    const token = jwt.sign({ id: result.rows[0].id }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true }).json({ token });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $1", [identifier]);
    if (!result.rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true }).json({
      token,
      user: { id: user.id, email: user.email, username: user.username }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/auth/logout", (req, res) => {
  const token = req.cookies.token;
  if (token) tokenBlacklist.add(token);
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false
  });
  res.json({ message: "Logged out securely" });
});

const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
=======
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");

app.use(express.json());
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("✅ Server is up.");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

