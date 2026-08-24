import "server-only";
import { getSql } from "@/lib/db";
import type { AnimalEntry, Club, Exhibition, Exhibitor } from "@/lib/types";

export async function getCounts() {
  const sql = getSql();
  const [clubs, exhibitions, exhibitors, entries] = await Promise.all([
    sql`SELECT count(*)::int AS count FROM clubs`, sql`SELECT count(*)::int AS count FROM exhibitions`,
    sql`SELECT count(*)::int AS count FROM exhibitors`, sql`SELECT count(*)::int AS count FROM animal_entries`,
  ]);
  return { clubs: clubs[0].count as number, exhibitions: exhibitions[0].count as number, exhibitors: exhibitors[0].count as number, entries: entries[0].count as number };
}

export async function getClubs() { return await getSql()`SELECT * FROM clubs ORDER BY name` as Club[]; }
export async function getClub(id: string) { const rows = await getSql()`SELECT * FROM clubs WHERE id=${id}` as Club[]; return rows[0]; }
export async function getExhibitions() { return await getSql()`SELECT e.*, c.short_name AS club_name FROM exhibitions e JOIN clubs c ON c.id=e.club_id ORDER BY e.starts_at DESC` as Exhibition[]; }
export async function getExhibition(id: string) { const rows = await getSql()`SELECT e.*, c.short_name AS club_name FROM exhibitions e JOIN clubs c ON c.id=e.club_id WHERE e.id=${id}` as Exhibition[]; return rows[0]; }
export async function getExhibitors(search = "") {
  if (!search) return await getSql()`SELECT x.*, c.short_name AS club_name FROM exhibitors x JOIN clubs c ON c.id=x.club_id ORDER BY x.last_name, x.first_name` as Exhibitor[];
  const term = `%${search}%`;
  return await getSql()`SELECT x.*, c.short_name AS club_name FROM exhibitors x JOIN clubs c ON c.id=x.club_id WHERE x.first_name ILIKE ${term} OR x.last_name ILIKE ${term} OR x.city ILIKE ${term} OR x.association_name ILIKE ${term} OR x.email ILIKE ${term} ORDER BY x.last_name, x.first_name` as Exhibitor[];
}
export async function getExhibitor(id: string) { const rows = await getSql()`SELECT x.*, c.short_name AS club_name FROM exhibitors x JOIN clubs c ON c.id=x.club_id WHERE x.id=${id}` as Exhibitor[]; return rows[0]; }
export async function getEntries(search = "", exhibitionId = "") {
  const term = `%${search}%`; const sql = getSql();
  if (search && exhibitionId) return await sql`SELECT a.*, e.title AS exhibition_title, x.first_name || ' ' || x.last_name AS exhibitor_name FROM animal_entries a JOIN exhibitions e ON e.id=a.exhibition_id JOIN exhibitors x ON x.id=a.exhibitor_id WHERE a.exhibition_id=${exhibitionId} AND (a.breed ILIKE ${term} OR a.ring_number ILIKE ${term} OR x.first_name ILIKE ${term} OR x.last_name ILIKE ${term}) ORDER BY a.created_at DESC` as AnimalEntry[];
  if (exhibitionId) return await sql`SELECT a.*, e.title AS exhibition_title, x.first_name || ' ' || x.last_name AS exhibitor_name FROM animal_entries a JOIN exhibitions e ON e.id=a.exhibition_id JOIN exhibitors x ON x.id=a.exhibitor_id WHERE a.exhibition_id=${exhibitionId} ORDER BY a.created_at DESC` as AnimalEntry[];
  if (search) return await sql`SELECT a.*, e.title AS exhibition_title, x.first_name || ' ' || x.last_name AS exhibitor_name FROM animal_entries a JOIN exhibitions e ON e.id=a.exhibition_id JOIN exhibitors x ON x.id=a.exhibitor_id WHERE a.breed ILIKE ${term} OR a.ring_number ILIKE ${term} OR x.first_name ILIKE ${term} OR x.last_name ILIKE ${term} ORDER BY a.created_at DESC` as AnimalEntry[];
  return await sql`SELECT a.*, e.title AS exhibition_title, x.first_name || ' ' || x.last_name AS exhibitor_name FROM animal_entries a JOIN exhibitions e ON e.id=a.exhibition_id JOIN exhibitors x ON x.id=a.exhibitor_id ORDER BY a.created_at DESC` as AnimalEntry[];
}
export async function getEntry(id: string) { const rows = await getSql()`SELECT a.*, e.title AS exhibition_title, x.first_name || ' ' || x.last_name AS exhibitor_name FROM animal_entries a JOIN exhibitions e ON e.id=a.exhibition_id JOIN exhibitors x ON x.id=a.exhibitor_id WHERE a.id=${id}` as AnimalEntry[]; return rows[0]; }
