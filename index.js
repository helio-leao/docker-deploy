const express = require("express");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

const pool = new Pool({
  host: "postgres",
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Create table if not exists
pool.query(
  `CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY, 
    title TEXT NOT NULL, 
    message TEXT NOT NULL
  )`
);

// Add a post
app.post("/posts", async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message)
    return res.status(400).json({ error: "Title and message required" });

  try {
    const result = await pool.query(
      "INSERT INTO posts (title, message) VALUES ($1, $2) RETURNING *",
      [title, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
