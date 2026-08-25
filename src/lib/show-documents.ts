import "server-only";
import {getSql} from "@/lib/db";
import {withDatabaseLogging} from "@/lib/database-error";
import type {EntryFeeItem,ManagedAnimal,ManagedEntry} from "@/lib/types";

export type DocumentShow={id:string;club_id:string;title:string;club_name:string;venue:string;starts_at:string;ends_at:string};
export type DocumentEntry=ManagedEntry&{animals:ManagedAnimal[];fees:EntryFeeItem[]};
export type ShowDocumentData={show:DocumentShow;entries:DocumentEntry[];animals:ManagedAnimal[]};
export type CatalogChecks={total:number;withoutCage:number;duplicateCages:number;withoutBreed:number;withoutColor:number;withoutSex:number;withoutAge:number;withoutRing:number};

const animalQuery=`SELECT a.id::text,a.entry_id::text,a.show_id::text,e.exhibitor_number,concat_ws(' ',x.first_name,x.last_name) AS exhibitor_name,c.name AS category,bg.name AS breed_group,b.name AS breed,cv.name AS color,a.breed_color_variant_id::text AS breed_variant_id,c.sort_order AS category_sort,bg.sort_order AS group_sort,b.sort_order AS breed_sort,bcv.standard_sort_order AS color_sort,a.entry_type AS species,a.sex,a.age_class,coalesce(a.ring_number,'') AS ring_number,a.cage_number,a.catalog_number,a.withdrawn,e.workflow_status AS status FROM animals a JOIN entries e ON e.id=a.entry_id JOIN exhibitors x ON x.id=e.exhibitor_id JOIN breed_color_variants bcv ON bcv.id=a.breed_color_variant_id JOIN breeds b ON b.id=bcv.breed_id JOIN breed_groups bg ON bg.id=b.breed_group_id JOIN animal_categories c ON c.id=bg.category_id JOIN color_variants cv ON cv.id=bcv.color_variant_id JOIN shows s ON s.id=a.show_id WHERE a.show_id=$1 AND s.club_id=$2 AND NOT a.withdrawn AND e.workflow_status<>'cancelled' ORDER BY c.sort_order,bg.sort_order,b.sort_order,bcv.standard_sort_order,a.sex,a.age_class,a.catalog_number NULLS LAST,e.exhibitor_number NULLS LAST,a.created_at`;

export async function getShowDocumentData(showId:string,clubId:string):Promise<ShowDocumentData|undefined>{
  return withDatabaseLogging("show-documents.load",async()=>{
    const sql=getSql(),showRows=await sql.query("SELECT s.id::text,s.club_id::text,s.name AS title,c.name AS club_name,coalesce(s.venue_name,'') AS venue,s.show_start::text AS starts_at,s.show_end::text AS ends_at FROM shows s JOIN clubs c ON c.id=s.club_id WHERE s.id=$1 AND s.club_id=$2",[showId,clubId]) as DocumentShow[];
    if(!showRows[0])return undefined;
    const [entryRows,animalRows,feeRows]=await Promise.all([
      sql.query("SELECT e.id::text,e.show_id::text,s.name AS show_title,e.exhibitor_id::text,e.exhibitor_number,e.registration_number,e.submitted_at::text,e.workflow_status,x.first_name,x.last_name,coalesce(x.street,'') AS street,coalesce(x.house_number,'') AS house_number,coalesce(x.postal_code,'') AS postal_code,coalesce(x.city,'') AS city,coalesce(x.email,'') AS email,coalesce(x.phone,'') AS phone,coalesce(x.livestock_number,'') AS livestock_number,coalesce(x.exhibitor_club_name,'') AS association_name,coalesce(x.age_group,'') AS age_group,e.single_count,e.aviary_count,e.stem_count,(SELECT count(*)::int FROM animals a WHERE a.entry_id=e.id AND NOT a.withdrawn) AS animal_count,e.total_amount::text,e.paid_amount::text,greatest(e.total_amount-e.paid_amount,0)::text AS remaining_amount,e.payment_status,e.paid_at::text,e.payment_method FROM entries e JOIN shows s ON s.id=e.show_id JOIN exhibitors x ON x.id=e.exhibitor_id WHERE e.show_id=$1 AND s.club_id=$2 AND e.workflow_status<>'cancelled' ORDER BY e.exhibitor_number NULLS LAST,x.last_name,x.first_name",[showId,clubId]),
      sql.query(animalQuery,[showId,clubId]),
      sql.query("SELECT fi.id::text,fi.entry_id::text,fi.description,fi.fee_type,fi.quantity::text,fi.unit_amount::text,fi.total_amount::text FROM entry_fee_items fi JOIN entries e ON e.id=fi.entry_id JOIN shows s ON s.id=e.show_id WHERE e.show_id=$1 AND s.club_id=$2 ORDER BY fi.created_at",[showId,clubId])
    ]);
    const animals=animalRows as unknown as ManagedAnimal[],fees=feeRows as unknown as Array<EntryFeeItem&{entry_id:string}>,entries=(entryRows as unknown as ManagedEntry[]).map(entry=>({...entry,animals:animals.filter(animal=>animal.entry_id===entry.id),fees:fees.filter(fee=>fee.entry_id===entry.id)}));
    return{show:showRows[0],entries,animals};
  });
}

export function catalogChecks(animals:ManagedAnimal[]):CatalogChecks{
  const cages=new Map<string,number>();for(const animal of animals){const cage=String(animal.catalog_number??animal.cage_number??"").trim();if(cage)cages.set(cage,(cages.get(cage)??0)+1)}
  return{total:animals.length,withoutCage:animals.filter(a=>!a.catalog_number&&!a.cage_number).length,duplicateCages:[...cages.values()].filter(count=>count>1).length,withoutBreed:animals.filter(a=>!a.breed).length,withoutColor:animals.filter(a=>!a.color).length,withoutSex:animals.filter(a=>!a.sex).length,withoutAge:animals.filter(a=>!a.age_class).length,withoutRing:animals.filter(a=>!a.ring_number).length};
}

export function safeDocumentName(value:string){return value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_|_$/g,"")||"Ausstellung"}
