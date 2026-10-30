// Runs `prisma migrate deploy` during the build when a database is connected.
// Skips (with a warning) when DATABASE_URL isn't set, so the site can still build.
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.warn("[migrate] DATABASE_URL is not set; skipping migrations. Connect Postgres (Neon) to enable accounts and projects.");
  process.exit(0);
}
if (!process.env.DATABASE_URL_UNPOOLED) process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
