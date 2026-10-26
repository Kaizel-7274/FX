import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const [courses] = await pool.execute(
      `SELECT id, title, description, level, estimated_minutes, created_at
       FROM courses
       WHERE status = 'published'
       ORDER BY created_at DESC`,
    );
    res.json({ courses });
  } catch (error) {
    next(error);
  }
});

export default router;
