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

