import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSql } from "@/lib/db";
import { hashSessionToken, SESSION_COOKIE } from "@/lib/auth";
import type { Club } from "@/lib/types";

export type ClubRole = "club_admin" | "show_manager" | "cashier" | "registration_office" | "judge" | "viewer";
export type ViewerSession = { userId:string; email:string; role:ClubRole|"operator"; club:Club; isOperator:boolean };
export type ClubActor = { userId:string; clubId:string; roles:ClubRole[] };

const projection = `SELECT cu.id AS user_id,coalesce(cu.email,'') AS user_email,cu.role,
  c.id,c.name,coalesce(c.short_name,'') AS short_name,coalesce(c.street,'') AS street,
  coalesce(c.postal_code,'') AS postal_code,coalesce(c.city,'') AS city,
  concat_ws(', ',nullif(c.street,''),nullif(concat_ws(' ',c.postal_code,c.city),'')) AS address,
  coalesce(c.contact_name,'') AS contact_person,coalesce(c.email,'') AS email,
  coalesce(c.phone,'') AS phone,c.logo_url,c.active,c.created_at::text AS created_at
  FROM club_users cu JOIN clubs c ON c.id=cu.club_id`;

export const getViewerSession = cache(async ():Promise<ViewerSession|null> => {
  const token=(await cookies()).get(SESSION_COOKIE)?.value;
  if(!token)return null;
  const rows=await getSql().query(`${projection} WHERE cu.session_token_hash=$1 AND cu.session_expires_at>now() AND cu.active=true`,[hashSessionToken(token)]) as Array<Club&{user_id:string;user_email:string;role:string}>;
  const row=rows[0];if(!row)return null;
  const isOperator=row.role==="operator";if(!isOperator&&!row.active)return null;
  const{user_id,user_email,role,...club}=row;
  return{userId:user_id,email:user_email,role:role as ViewerSession["role"],club,isOperator};
});
export async function getActiveClub(){return(await getViewerSession())?.club??null}
export async function requireActiveClub(){const session=await getViewerSession();if(!session)redirect("/verein-login");if(session.isOperator)redirect("/betreiber");return session.club}
export async function getClubActor():Promise<ClubActor>{const session=await getViewerSession();if(!session)redirect("/verein-login");if(session.isOperator)redirect("/betreiber");return{userId:session.userId,clubId:session.club.id,roles:[session.role as ClubRole]}}
export async function requireOperator(){const session=await getViewerSession();if(!session)redirect("/betreiber-login");if(!session.isOperator)redirect("/");return session}

async function exists(query:string,values:string[]){const rows=await getSql().query(query,values) as{exists:boolean}[];return Boolean(rows[0]?.exists)}
export async function assertShowBelongsToClub(showId:string,clubId:string){if(!await exists("SELECT EXISTS(SELECT 1 FROM shows WHERE id=$1 AND club_id=$2) AS exists",[showId,clubId]))throw new Error("Datensatz nicht gefunden oder kein Zugriff.")}
export async function assertExhibitorBelongsToClub(exhibitorId:string,clubId:string){if(!await exists("SELECT EXISTS(SELECT 1 FROM exhibitors x JOIN shows s ON s.id=x.show_id WHERE x.id=$1 AND s.club_id=$2) AS exists",[exhibitorId,clubId]))throw new Error("Datensatz nicht gefunden oder kein Zugriff.")}
export async function assertAnimalBelongsToClub(animalId:string,clubId:string){if(!await exists("SELECT EXISTS(SELECT 1 FROM animals a JOIN shows s ON s.id=a.show_id WHERE a.id=$1 AND s.club_id=$2) AS exists",[animalId,clubId]))throw new Error("Datensatz nicht gefunden oder kein Zugriff.")}
