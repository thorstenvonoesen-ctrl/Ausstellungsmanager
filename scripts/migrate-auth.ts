import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
async function main(){const databaseUrl=process.env.DATABASE_URL;if(!databaseUrl)throw new Error("DATABASE_URL ist nicht gesetzt.");const sql=neon(databaseUrl),migration=await readFile(resolve("database/002_club_auth.sql"),"utf8");for(const statement of migration.split(";").map(value=>value.trim()).filter(Boolean))await sql.query(statement);console.log("Migration 002_club_auth.sql erfolgreich ausgeführt.")}
main().catch(error=>{console.error("Auth-Migration fehlgeschlagen:",error);process.exitCode=1});
