import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL ist nicht gesetzt.");

  const sql = neon(databaseUrl);
  const migration = await readFile(resolve("database/001_initial.sql"), "utf8");
  await sql.query(migration);
  console.log("Migration 001_initial.sql erfolgreich ausgeführt.");
}

main().catch((error) => {
  console.error("Migration fehlgeschlagen:", error);
  process.exitCode = 1;
});
