const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../db'); 

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Dummy in-memory post array 
const posts = [];

router.post('/create', upload.single('image'), (req, res) => {
  const { content } = req.body;
  const image = req.file ? req.file.filename : null;

  const newPost = { id: Date.now(), content, image };
  posts.push(newPost);

  res.status(201).json({ message: 'Post created', post: newPost });
});


router.get('/recommended-feed', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.username
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching recommended feed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
