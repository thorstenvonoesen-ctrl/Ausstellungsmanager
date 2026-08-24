import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSql } from "@/lib/db";
import type { Club } from "@/lib/types";

export const ACTIVE_CLUB_COOKIE = "ausstellungsmanager_active_club";

export type ClubRole = "club_admin" | "show_manager" | "cashier" | "registration_office" | "judge" | "viewer";
export type ClubActor = { userId: string | null; clubId: string; roles: ClubRole[] };

const clubProjection = `SELECT id,name,short_name,street,postal_code,city,concat_ws(', ',nullif(street,''),nullif(concat_ws(' ',postal_code,city),'')) AS address,contact_name AS contact_person,email,phone,logo_url,active,created_at::text AS created_at FROM clubs`;

export const getActiveClub = cache(async (): Promise<Club | null> => {
  const cookieStore = await cookies();
  const selectedId = cookieStore.get(ACTIVE_CLUB_COOKIE)?.value;
  const sql = getSql();
  if (selectedId) {
    const rows = await sql.query(`${clubProjection} WHERE id=$1 AND active=true`, [selectedId]) as Club[];
    if (rows[0]) return rows[0];
  }
  const active = await sql.query(`${clubProjection} WHERE active=true ORDER BY name LIMIT 2`) as Club[];
  return active.length === 1 ? active[0] : null;
});

export async function requireActiveClub(): Promise<Club> {
  const club = await getActiveClub();
  if (!club) redirect("/verein-waehlen");
  return club;
}

// Auth-ready boundary: later this function resolves club_users and roles.
export async function getClubActor(): Promise<ClubActor> {
  const club = await requireActiveClub();
  return { userId: null, clubId: club.id, roles: ["club_admin"] };
}

async function exists(query: string, values: string[]) {
  const rows = await getSql().query(query, values) as { exists: boolean }[];
  return Boolean(rows[0]?.exists);
}

export async function assertShowBelongsToClub(showId: string, clubId: string) {
  if (!await exists("SELECT EXISTS(SELECT 1 FROM shows WHERE id=$1 AND club_id=$2) AS exists", [showId, clubId])) throw new Error("Datensatz nicht gefunden oder kein Zugriff.");
}
export async function assertExhibitorBelongsToClub(exhibitorId: string, clubId: string) {
  if (!await exists("SELECT EXISTS(SELECT 1 FROM exhibitors x JOIN shows s ON s.id=x.show_id WHERE x.id=$1 AND s.club_id=$2) AS exists", [exhibitorId, clubId])) throw new Error("Datensatz nicht gefunden oder kein Zugriff.");
}
export async function assertAnimalBelongsToClub(animalId: string, clubId: string) {
  if (!await exists("SELECT EXISTS(SELECT 1 FROM animals a JOIN shows s ON s.id=a.show_id WHERE a.id=$1 AND s.club_id=$2) AS exists", [animalId, clubId])) throw new Error("Datensatz nicht gefunden oder kein Zugriff.");
}
