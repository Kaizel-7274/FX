import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const [classes] = await pool.execute(
      `SELECT id, title, description, starts_at, duration_minutes
       FROM classes WHERE status = 'scheduled' AND starts_at >= UTC_TIMESTAMP()
       ORDER BY starts_at ASC LIMIT 50`,
    );
    res.json({ classes });
  } catch (error) {
    next(error);
  }
});

export default router;
