import express from "express";
import db from "./db.js";
import quoteRoutes from "./routes/quotes.js";

const app = express();
const PORT = 3001;

// Lets us read JSON sent from the client.
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Express server is running!",
  });
});

app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello from the API!",
  });
});

app.get("/api/health", (req, res) => {
  // Quick check to see if the database is working.
  db.prepare("SELECT 1").get();
  res.json({ status: "ok", database: "connected" });
});

// Quote API routes are in a separate file to keep this file clean.
app.use("/api/quotes", quoteRoutes);

// Stops broken JSON from crashing the server.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON request body." });
  }

  return next(error);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
