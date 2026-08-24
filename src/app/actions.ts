"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSql } from "@/lib/db";

const text = z.string().trim().min(1, "Pflichtfeld").max(300);
const optional = z.string().trim().max(500).default("");
const uuid = z.string().uuid();
const email = z.union([z.literal(""), z.string().email("Ungültige E-Mail-Adresse")]);

function value(data: FormData, key: string) { return String(data.get(key) ?? ""); }
function fail(error: unknown): never {
  if (error instanceof z.ZodError) throw new Error(error.issues[0]?.message ?? "Bitte Eingaben prüfen.");
  throw error;
}

const clubSchema = z.object({ name: text, shortName: text.max(30), address: optional, contactPerson: optional, email, phone: optional, logoUrl: z.union([z.literal(""), z.string().url("Ungültige Logo-URL")]) });
export async function saveClub(data: FormData) {
  let id = value(data, "id");
  try {
    const v = clubSchema.parse({ name: value(data,"name"), shortName: value(data,"shortName"), address: value(data,"address"), contactPerson: value(data,"contactPerson"), email: value(data,"email"), phone: value(data,"phone"), logoUrl: value(data,"logoUrl") });
    const sql = getSql();
    if (id) { uuid.parse(id); await sql`UPDATE clubs SET name=${v.name}, short_name=${v.shortName}, address=${v.address}, contact_person=${v.contactPerson}, email=${v.email}, phone=${v.phone}, logo_url=${v.logoUrl || null} WHERE id=${id}`; }
    else { const rows = await sql`INSERT INTO clubs (name,short_name,address,contact_person,email,phone,logo_url) VALUES (${v.name},${v.shortName},${v.address},${v.contactPerson},${v.email},${v.phone},${v.logoUrl || null}) RETURNING id`; id = rows[0].id as string; }
  } catch (e) { fail(e); }
  revalidatePath("/"); revalidatePath("/vereine"); redirect(`/vereine/${id}`);
}

const exhibitionSchema = z.object({ clubId: uuid, title: text, venue: text, venueAddress: optional, startsAt: z.iso.date(), endsAt: z.iso.date(), deadline: z.iso.date(), status: z.enum(["Entwurf","Geplant","Meldung offen","Meldung geschlossen","Laufend","Abgeschlossen","Abgesagt"]), description: optional }).refine(v => v.endsAt >= v.startsAt, { message: "Das Ende darf nicht vor dem Beginn liegen." });
export async function saveExhibition(data: FormData) {
  let id = value(data,"id");
  try {
    const v=exhibitionSchema.parse({clubId:value(data,"clubId"),title:value(data,"title"),venue:value(data,"venue"),venueAddress:value(data,"venueAddress"),startsAt:value(data,"startsAt"),endsAt:value(data,"endsAt"),deadline:value(data,"deadline"),status:value(data,"status"),description:value(data,"description")}); const sql=getSql();
    if(id){uuid.parse(id);await sql`UPDATE exhibitions SET club_id=${v.clubId},title=${v.title},venue=${v.venue},venue_address=${v.venueAddress},starts_at=${v.startsAt},ends_at=${v.endsAt},registration_deadline=${v.deadline},status=${v.status},description=${v.description} WHERE id=${id}`;}
    else{const rows=await sql`INSERT INTO exhibitions(club_id,title,venue,venue_address,starts_at,ends_at,registration_deadline,status,description) VALUES(${v.clubId},${v.title},${v.venue},${v.venueAddress},${v.startsAt},${v.endsAt},${v.deadline},${v.status},${v.description}) RETURNING id`;id=rows[0].id as string;}
  } catch(e){fail(e);} revalidatePath("/");revalidatePath("/ausstellungen");redirect("/ausstellungen");
}

const exhibitorSchema=z.object({clubId:uuid,firstName:text,lastName:text,street:optional,houseNumber:optional,postalCode:optional,city:optional,email,phone:optional,associationName:optional,membershipNumber:optional});
export async function saveExhibitor(data:FormData){let id=value(data,"id");try{const v=exhibitorSchema.parse({clubId:value(data,"clubId"),firstName:value(data,"firstName"),lastName:value(data,"lastName"),street:value(data,"street"),houseNumber:value(data,"houseNumber"),postalCode:value(data,"postalCode"),city:value(data,"city"),email:value(data,"email"),phone:value(data,"phone"),associationName:value(data,"associationName"),membershipNumber:value(data,"membershipNumber")});const sql=getSql();if(id){uuid.parse(id);await sql`UPDATE exhibitors SET club_id=${v.clubId},first_name=${v.firstName},last_name=${v.lastName},street=${v.street},house_number=${v.houseNumber},postal_code=${v.postalCode},city=${v.city},email=${v.email},phone=${v.phone},association_name=${v.associationName},membership_number=${v.membershipNumber||null} WHERE id=${id}`;}else{const rows=await sql`INSERT INTO exhibitors(club_id,first_name,last_name,street,house_number,postal_code,city,email,phone,association_name,membership_number) VALUES(${v.clubId},${v.firstName},${v.lastName},${v.street},${v.houseNumber},${v.postalCode},${v.city},${v.email},${v.phone},${v.associationName},${v.membershipNumber||null}) RETURNING id`;id=rows[0].id as string;}}catch(e){fail(e);}revalidatePath("/");revalidatePath("/aussteller");redirect(`/aussteller/${id}`);}

const entrySchema=z.object({exhibitionId:uuid,exhibitorId:uuid,species:text,breed:text,color:optional,sex:z.enum(["1,0","0,1","unbekannt"]),birthYear:z.coerce.number().int().min(1900).max(2200),ringNumber:text,cageNumber:optional,entryFee:z.coerce.number().min(0).max(999999),status:z.enum(["Gemeldet","Bestätigt","Abgemeldet","Bewertet"])});
export async function saveEntry(data:FormData){let id=value(data,"id");try{const v=entrySchema.parse({exhibitionId:value(data,"exhibitionId"),exhibitorId:value(data,"exhibitorId"),species:value(data,"species"),breed:value(data,"breed"),color:value(data,"color"),sex:value(data,"sex"),birthYear:value(data,"birthYear"),ringNumber:value(data,"ringNumber"),cageNumber:value(data,"cageNumber"),entryFee:value(data,"entryFee"),status:value(data,"status")});const sql=getSql();if(id){uuid.parse(id);await sql`UPDATE animal_entries SET exhibition_id=${v.exhibitionId},exhibitor_id=${v.exhibitorId},species=${v.species},breed=${v.breed},color=${v.color},sex=${v.sex},birth_year=${v.birthYear},ring_number=${v.ringNumber},cage_number=${v.cageNumber||null},entry_fee=${v.entryFee},status=${v.status} WHERE id=${id}`;}else{const rows=await sql`INSERT INTO animal_entries(exhibition_id,exhibitor_id,species,breed,color,sex,birth_year,ring_number,cage_number,entry_fee,status) VALUES(${v.exhibitionId},${v.exhibitorId},${v.species},${v.breed},${v.color},${v.sex},${v.birthYear},${v.ringNumber},${v.cageNumber||null},${v.entryFee},${v.status}) RETURNING id`;id=rows[0].id as string;}}catch(e){fail(e);}revalidatePath("/");revalidatePath("/tiermeldungen");redirect("/tiermeldungen");}

export async function deleteEntity(data:FormData){const kind=z.enum(["club","exhibition","exhibitor","entry"]).parse(value(data,"kind"));const id=uuid.parse(value(data,"id"));const sql=getSql();if(kind==="club")await sql`DELETE FROM clubs WHERE id=${id}`;if(kind==="exhibition")await sql`DELETE FROM exhibitions WHERE id=${id}`;if(kind==="exhibitor")await sql`DELETE FROM exhibitors WHERE id=${id}`;if(kind==="entry")await sql`DELETE FROM animal_entries WHERE id=${id}`;revalidatePath("/");revalidatePath("/vereine");revalidatePath("/ausstellungen");revalidatePath("/aussteller");revalidatePath("/tiermeldungen");}
