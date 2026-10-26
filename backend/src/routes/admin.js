import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireUser } from "../auth.js";
import { pool } from "../db.js";

const router = Router();
const idSchema = z.coerce.number().int().positive();
const courseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(1).max(5000),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  estimated_minutes: z.number().int().min(0).max(65535),
  status: z.enum(["draft", "published", "archived"]),
});
const classSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(1).max(5000),
  starts_at: z.string().datetime({ offset: true }),
  duration_minutes: z.number().int().min(1).max(1440),
  status: z.enum(["scheduled", "cancelled", "completed"]),
});

router.use(requireUser, requireAdmin);

router.get("/overview", async (_req, res, next) => {
  try {
    const [[users]] = await pool.execute("SELECT COUNT(*) AS total FROM users");
    const [[courses]] = await pool.execute("SELECT COUNT(*) AS total FROM courses");
    const [[classes]] = await pool.execute("SELECT COUNT(*) AS total FROM classes WHERE status = 'scheduled'");
    res.json({
      users: users.total,
      courses: courses.total,
      scheduledClasses: classes.total,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (_req, res, next) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 200",
    );
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id/role", async (req, res, next) => {
  const id = idSchema.safeParse(req.params.id);
  const role = z.enum(["member", "admin"]).safeParse(req.body?.role);
  if (!id.success || !role.success) {
    res.status(400).json({ error: "A valid user ID and role are required." });
    return;
  }
  if (Number(req.user.id) === id.data && role.data !== "admin") {
    res.status(400).json({ error: "You cannot remove your own administrator role." });
    return;
  }

  try {
    if (role.data === "member") {
      const [[admins]] = await pool.execute("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'");
      const [[target]] = await pool.execute("SELECT role FROM users WHERE id = ?", [id.data]);
      if (!target) {
        res.status(404).json({ error: "User not found." });
        return;
      }
      if (target.role === "admin" && Number(admins.total) <= 1) {
        res.status(409).json({ error: "The last administrator cannot be demoted." });
        return;
      }
    }
    const [result] = await pool.execute("UPDATE users SET role = ? WHERE id = ?", [role.data, id.data]);
    if (!result.affectedRows) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.json({ id: id.data, role: role.data });
  } catch (error) {
    next(error);
  }
});

router.get("/courses", async (_req, res, next) => {
  try {
    const [courses] = await pool.execute(
      "SELECT id, title, description, level, estimated_minutes, status, created_at FROM courses ORDER BY created_at DESC LIMIT 200",
    );
    res.json({ courses });
  } catch (error) {
    next(error);
  }
});

router.post("/courses", async (req, res, next) => {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide a title, description, level, duration, and status." });
    return;
  }
  try {
    const { title, description, level, estimated_minutes, status } = parsed.data;
    const [result] = await pool.execute(
      "INSERT INTO courses (title, description, level, estimated_minutes, status) VALUES (?, ?, ?, ?, ?)",
      [title, description, level, estimated_minutes, status],
    );
    res.status(201).json({ id: result.insertId, ...parsed.data });
  } catch (error) {
    next(error);
  }
});

router.patch("/courses/:id", async (req, res, next) => {
  const id = idSchema.safeParse(req.params.id);
  const parsed = courseSchema.safeParse(req.body);
  if (!id.success || !parsed.success) {
    res.status(400).json({ error: "A valid course ID and complete course details are required." });
    return;
  }
  try {
    const { title, description, level, estimated_minutes, status } = parsed.data;
    const [result] = await pool.execute(
      "UPDATE courses SET title = ?, description = ?, level = ?, estimated_minutes = ?, status = ? WHERE id = ?",
      [title, description, level, estimated_minutes, status, id.data],
    );
    if (!result.affectedRows) {
      res.status(404).json({ error: "Course not found." });
      return;
    }
    res.json({ id: id.data, ...parsed.data });
  } catch (error) {
    next(error);
  }
});

router.delete("/courses/:id", async (req, res, next) => {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) {
    res.status(400).json({ error: "A valid course ID is required." });
    return;
  }
  try {
    const [result] = await pool.execute("DELETE FROM courses WHERE id = ?", [id.data]);
    if (!result.affectedRows) {
      res.status(404).json({ error: "Course not found." });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/classes", async (_req, res, next) => {
  try {
    const [classes] = await pool.execute(
      "SELECT id, title, description, starts_at, duration_minutes, status, created_at FROM classes ORDER BY starts_at DESC LIMIT 200",
    );
    res.json({ classes });
  } catch (error) {
    next(error);
  }
});

router.post("/classes", async (req, res, next) => {
  const parsed = classSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide a title, description, date, duration, and status." });
    return;
  }
  try {
    const { title, description, starts_at, duration_minutes, status } = parsed.data;
    const [result] = await pool.execute(
      "INSERT INTO classes (title, description, starts_at, duration_minutes, status) VALUES (?, ?, ?, ?, ?)",
      [title, description, new Date(starts_at), duration_minutes, status],
    );
    res.status(201).json({ id: result.insertId, ...parsed.data });
  } catch (error) {
    next(error);
  }
});

router.patch("/classes/:id", async (req, res, next) => {
  const id = idSchema.safeParse(req.params.id);
  const parsed = classSchema.safeParse(req.body);
  if (!id.success || !parsed.success) {
    res.status(400).json({ error: "A valid class ID and complete class details are required." });
    return;
  }
  try {
    const { title, description, starts_at, duration_minutes, status } = parsed.data;
    const [result] = await pool.execute(
      "UPDATE classes SET title = ?, description = ?, starts_at = ?, duration_minutes = ?, status = ? WHERE id = ?",
      [title, description, new Date(starts_at), duration_minutes, status, id.data],
    );
    if (!result.affectedRows) {
      res.status(404).json({ error: "Class not found." });
      return;
    }
    res.json({ id: id.data, ...parsed.data });
  } catch (error) {
    next(error);
  }
});

router.delete("/classes/:id", async (req, res, next) => {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) {
    res.status(400).json({ error: "A valid class ID is required." });
    return;
  }
  try {
    const [result] = await pool.execute("DELETE FROM classes WHERE id = ?", [id.data]);
    if (!result.affectedRows) {
      res.status(404).json({ error: "Class not found." });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
