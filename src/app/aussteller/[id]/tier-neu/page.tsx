import {notFound} from "next/navigation";
import {ManagedAnimalForm} from "@/components/managed-animal-form";
import {FormHeader} from "@/components/ui";
import {requireActiveClub} from "@/lib/club-context";
import {getBreedVariants,getManagedEntryByExhibitor} from "@/lib/data";

export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){
  const [{id},club]=await Promise.all([params,requireActiveClub()]);
  const [record,variants]=await Promise.all([getManagedEntryByExhibitor(id,club.id),getBreedVariants()]);
  if(!record)notFound();
  return <div className="form-shell"><FormHeader title="Tier ergänzen" back={`/aussteller/${id}`}/><ManagedAnimalForm entryId={record.entry.id} exhibitorId={id} variants={variants}/></div>;
}
