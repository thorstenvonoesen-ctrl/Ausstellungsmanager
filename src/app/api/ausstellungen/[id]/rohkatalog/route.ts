import {requireActiveClub} from "@/lib/club-context";
import {createRawCatalogPdf} from "@/lib/pdf-documents";
import {getShowDocumentData,safeDocumentName} from "@/lib/show-documents";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const[{id},club]=await Promise.all([params,requireActiveClub()]),data=await getShowDocumentData(id,club.id);if(!data)return new Response("Nicht gefunden",{status:404});const pdf=await createRawCatalogPdf(data),year=new Date(data.show.starts_at).getFullYear(),name=`Rohkatalog_${safeDocumentName(data.show.title)}_${year}.pdf`;return new Response(new Uint8Array(pdf),{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="${name}"`,"Cache-Control":"private, no-store"}})}
