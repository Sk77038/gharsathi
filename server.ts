import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Ghar Sathi API is running" });
  });

  // Mock API for B2B jobs
  app.post("/api/b2b/jobs", (req, res) => {
    const { title, workersNeeded, location, duration, budget } = req.body;
    // In a real app, save to Supabase
    res.json({ success: true, message: "B2B Job created successfully", jobId: "b2b-" + Date.now() });
  });

  // API for Custom Job Posting (Customer App)
  app.post("/api/jobs", (req, res) => {
    const { title, budget } = req.body;
    console.log("New custom job posted:", title, budget);
    res.json({ success: true, message: "Job posted successfully! Nearby workers have been notified." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
