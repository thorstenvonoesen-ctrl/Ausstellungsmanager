import {requireActiveClub} from "@/lib/club-context";
import {createBFormsPdf} from "@/lib/pdf-documents";
import {getShowDocumentData,safeDocumentName} from "@/lib/show-documents";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){const[{id},club]=await Promise.all([params,requireActiveClub()]),data=await getShowDocumentData(id,club.id);if(!data)return new Response("Nicht gefunden",{status:404});const entryId=new URL(request.url).searchParams.get("meldung")??undefined;if(entryId&&!data.entries.some(entry=>entry.id===entryId))return new Response("Nicht gefunden",{status:404});const pdf=await createBFormsPdf(data,entryId),year=new Date(data.show.starts_at).getFullYear(),name=entryId?`B-Bogen_${safeDocumentName(data.entries.find(e=>e.id===entryId)!.last_name)}_${year}.pdf`:`B-Boegen_${safeDocumentName(data.show.title)}_${year}.pdf`;return new Response(new Uint8Array(pdf),{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="${name}"`,"Cache-Control":"private, no-store"}})}
