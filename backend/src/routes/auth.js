import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { createAccessToken, requireUser } from "../auth.js";
import { pool } from "../db.js";

const router = Router();
const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128).refine((value) => new TextEncoder().encode(value).length <= 72),
});
const registrationSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(80),
});
const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
});
const dummyPasswordHash = await bcrypt.hash("amazonfx-invalid-sign-in", 12);
const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api",
  maxAge: 8 * 60 * 60 * 1000,
};
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please try again later." },
});

router.post("/register", authLimiter, async (req, res, next) => {
  const parsed = registrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Please provide a name, a valid email, and a password of 12 to 72 UTF-8 bytes.",
    });
    return;
  }

  try {
    const { name, email, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash],
    );
    const user = { id: result.insertId, name, email, role: "member" };
    res.cookie("afx_session", createAccessToken(user), sessionCookieOptions);
    res.status(201).json({ user });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "An account with that email already exists." });
      return;
    }
    next(error);
  }
});

router.post("/login", authLimiter, async (req, res, next) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide a valid email and a password of 12 to 72 UTF-8 bytes." });
    return;
  }

  try {
    const { email, password } = parsed.data;
    const [users] = await pool.execute(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    const user = users[0];
    const matches = await bcrypt.compare(password, user?.password_hash ?? dummyPasswordHash);
    if (!user || !matches) {
      res.status(401).json({ error: "Email or password is incorrect." });
      return;
    }

    const { password_hash: _passwordHash, ...safeUser } = user;
    res.cookie("afx_session", createAccessToken(safeUser), sessionCookieOptions);
    res.json({ user: safeUser });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireUser, (req, res) => {
  res.json({ user: req.user });
});

router.patch("/me", requireUser, async (req, res, next) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide a valid name and email address." });
    return;
  }

  try {
    const { name, email } = parsed.data;
    await pool.execute(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, req.user.id],
    );
    const [users] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [req.user.id],
    );
    const user = users[0];
    if (!user) {
      res.status(404).json({ error: "Account not found." });
      return;
    }
    res.json({ user });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "An account with that email already exists." });
      return;
    }
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("afx_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api",
  });
  res.status(204).end();
});

export default router;
