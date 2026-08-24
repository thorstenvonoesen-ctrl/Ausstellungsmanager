import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { neon } from "@neondatabase/serverless";

const scrypt=promisify(scryptCallback);
function prompt(label:string,{hidden=false}:{hidden?:boolean}={}){
  if(!process.stdin.isTTY||!process.stdout.isTTY)throw new Error("Das Setup muss in einem interaktiven Terminal ausgeführt werden.");
  return new Promise<string>((resolve,reject)=>{
    process.stdout.write(label);process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding("utf8");let value="";
    const finish=()=>{process.stdin.setRawMode(false);process.stdin.pause();process.stdin.off("data",onData);process.stdout.write("\n");resolve(value)};
    const onData=(input:string)=>{for(const key of input){if(key==="\r"||key==="\n")return finish();if(key==="\u0003"){process.stdin.setRawMode(false);process.stdin.pause();process.stdin.off("data",onData);reject(new Error("Setup abgebrochen."));return}if(key==="\u007f"){if(value){value=value.slice(0,-1);process.stdout.write("\b \b")}continue}value+=key;process.stdout.write(hidden?"*":key)}};
    process.stdin.on("data",onData);
  });
}
async function hashPassword(password:string){const salt=randomBytes(16).toString("hex"),derived=await scrypt(password,salt,64) as Buffer;return`scrypt$${salt}$${derived.toString("hex")}`}

async function main(){
  const databaseUrl=process.env.DATABASE_URL||await prompt("DATABASE_URL (wird nicht gespeichert): ",{hidden:true});
  const email=(await prompt("Betreiber-E-Mail: ")).trim().toLowerCase();
  const password=await prompt("Passwort (mindestens 10 Zeichen): ",{hidden:true});
  const confirmation=await prompt("Passwort wiederholen: ",{hidden:true});
  if(!/^\S+@\S+\.\S+$/.test(email))throw new Error("Die E-Mail-Adresse ist ungültig.");
  if(password.length<10||password.length>200)throw new Error("Das Passwort muss 10 bis 200 Zeichen lang sein.");
  if(password!==confirmation)throw new Error("Die Passwörter stimmen nicht überein.");
  const sql=neon(databaseUrl);
  const schema=await sql`SELECT is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='club_users' AND column_name='club_id'`;
  if(schema[0]?.is_nullable!=="YES")throw new Error("Migration 004 fehlt. Führen Sie zuerst npm run db:migrate-independent-operator aus.");
  const existing=await sql`SELECT role FROM club_users WHERE lower(email)=${email} LIMIT 1`;
  if(existing[0])throw new Error("Diese E-Mail-Adresse ist bereits vergeben. Bestehende Konten werden nicht verändert.");
  const passwordHash=await hashPassword(password);
  await sql`INSERT INTO club_users(club_id,auth_user_id,role,active,email,password_hash) VALUES(NULL,${`operator:${email}`},'operator',true,${email},${passwordHash})`;
  console.log("Betreiberkonto wurde angelegt. Anmeldung: /betreiber-login");
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Betreiber-Setup fehlgeschlagen.");process.exitCode=1});
