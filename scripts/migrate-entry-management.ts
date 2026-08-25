import {readFile} from "node:fs/promises";
import {loadEnvFile} from "node:process";
import {neon} from "@neondatabase/serverless";

async function main(){
  if(!process.env.DATABASE_URL){try{loadEnvFile(".env.local")}catch{loadEnvFile(".env")}}
  const url=process.env.DATABASE_URL;
  if(!url||!/^postgres(?:ql)?:\/\//i.test(url))throw new Error("Keine gültige DATABASE_URL gefunden.");
  const sql=neon(url),source=await readFile("database/007_entry_management.sql","utf8");
  for(const statement of source.split("-- next").map(value=>value.trim()).filter(Boolean))await sql.query(statement);
  console.log("Migration 007_entry_management.sql erfolgreich ausgeführt.");
}
main().catch(error=>{console.error("Migration 007 fehlgeschlagen:",error);process.exitCode=1});
