import { app } from "./app.js";
import { config } from "./config.js";
import { checkDatabase, pool } from "./db.js";

const server = app.listen(config.port, () => {
  console.info(`AmazonFX API listening on http://localhost:${config.port}`);
});

let shuttingDown = false;
async function shutdown(signal, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(`${signal} received; closing the API server.`);

  const timeout = setTimeout(() => {
    console.error("Graceful shutdown timed out.");
    process.exit(1);
  }, 10_000);
  timeout.unref();

  server.close(async (error) => {
    try {
      await pool.end();
      if (error) throw error;
      clearTimeout(timeout);
      process.exitCode = exitCode;
    } catch (shutdownError) {
      console.error("Could not close the database pool cleanly:", shutdownError);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

checkDatabase().then(
  () => console.info("MySQL connection is ready."),
  (error) => {
    console.error("Could not connect to MySQL. Check XAMPP and backend/.env:", error.message);
    void shutdown("Database connection failure", 1);
  },
);
