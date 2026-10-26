import "dotenv/config";

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const jwtSecret = required("JWT_SECRET");
if (jwtSecret.length < 32 || jwtSecret.startsWith("replace-this-")) {
  throw new Error("JWT_SECRET must be a unique value of at least 32 characters.");
}

const port = Number(process.env.PORT ?? 4000);
const databasePort = Number(process.env.DB_PORT ?? 3306);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}
if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
  throw new Error("DB_PORT must be a valid TCP port.");
}

export const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  jwtSecret,
  database: {
    host: required("DB_HOST", "127.0.0.1"),
    port: databasePort,
    name: required("DB_NAME", "amazonfx"),
    user: required("DB_USER", "root"),
    password: process.env.DB_PASSWORD ?? "",
  },
});
