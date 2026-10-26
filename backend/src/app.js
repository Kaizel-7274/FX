import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { checkDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import classRoutes from "./routes/classes.js";
import courseRoutes from "./routes/courses.js";
import journalRoutes from "./routes/journal.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: config.frontendOrigin.split(",").map((origin) => origin.trim()),
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
}));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/ready", async (_req, res) => {
  try {
    await checkDatabase();
    res.json({ status: "ready" });
  } catch (error) {
    console.error("MySQL readiness check failed:", error);
    res.status(503).json({ status: "unavailable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/journal", journalRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled API error:", error);
  if (res.headersSent) return;
  res.status(500).json({ error: "An unexpected server error occurred." });
});
