import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { pool } from "./db.js";

export function createAccessToken(user) {
  return jwt.sign(
    { sub: String(user.id) },
    config.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: "8h",
      issuer: "amazonfx-api",
      audience: "amazonfx-app",
    },
  );
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Administrator access is required." });
    return;
  }
  next();
}

export async function requireUser(req, res, next) {
  const authorization = req.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : undefined;
  const token = req.cookies?.afx_session ?? bearerToken;
  if (!token) {
    res.status(401).json({ error: "Authentication is required." });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "amazonfx-api",
      audience: "amazonfx-app",
    });
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      res.status(401).json({ error: "The access token is invalid or expired." });
      return;
    }

    const [users] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [payload.sub],
    );
    const user = users[0];
    if (!user) {
      res.status(401).json({ error: "The access token is invalid or expired." });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "The access token is invalid or expired." });
      return;
    }
    next(error);
  }
}
