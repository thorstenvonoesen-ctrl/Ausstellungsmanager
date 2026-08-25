import {notFound} from "next/navigation";
import {ManagedAnimalForm} from "@/components/managed-animal-form";
import {FormHeader} from "@/components/ui";
import {requireActiveClub} from "@/lib/club-context";
import {getBreedVariants,getManagedAnimals} from "@/lib/data";
import {getSql} from "@/lib/db";

export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){
  const [{id},club]=await Promise.all([params,requireActiveClub()]);
  const [rows,variants]=await Promise.all([getManagedAnimals(club.id,{}),getBreedVariants()]);
  const item=rows.find(row=>row.id===id);
  if(!item)notFound();
  const entryRows=await getSql()`SELECT exhibitor_id::text FROM entries WHERE id=${item.entry_id}`;
  const exhibitorId=String(entryRows[0].exhibitor_id);
  return <div className="form-shell"><FormHeader title="Tiermeldung bearbeiten" back={`/aussteller/${exhibitorId}`}/><ManagedAnimalForm entryId={item.entry_id} exhibitorId={exhibitorId} variants={variants} item={item}/></div>;
}
