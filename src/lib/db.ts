import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Die Datenbankverbindung ist nicht konfiguriert. Bitte DATABASE_URL setzen.");
  }
  client ??= neon(databaseUrl);
  return client;
}
