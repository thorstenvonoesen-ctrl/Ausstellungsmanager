import {saveManagedAnimal} from "@/app/actions";
import {Field,FormActions} from "@/components/ui";
import type {BreedVariant,ManagedAnimal} from "@/lib/types";

export function ManagedAnimalForm({entryId,exhibitorId,variants,item}:{entryId:string;exhibitorId:string;variants:BreedVariant[];item?:ManagedAnimal}){
  return <form action={saveManagedAnimal} className="form-card form-grid">
    <input type="hidden" name="entryId" value={entryId}/>
    <input type="hidden" name="animalId" value={item?.id??""}/>
    <Field label="Rasse und Farbenschlag" name="breedVariantId" required><select name="breedVariantId" defaultValue={item?.breed_variant_id} required><option value="">Bitte wählen</option>{variants.map(v=><option key={v.id} value={v.id}>{v.breed} · {v.color}</option>)}</select></Field>
    <Field label="Meldeart" name="species" required><select name="species" defaultValue={item?.species??"single"}><option value="single">Einzeltier</option><option value="stem">Stamm</option><option value="aviary">Voliere</option></select></Field>
    <Field label="Geschlecht" name="sex" required><select name="sex" defaultValue={item?.sex??"1,0"}><option value="1,0">1,0 männlich</option><option value="0,1">0,1 weiblich</option><option value="mixed">gemischt</option></select></Field>
    <Field label="Alter" name="ageClass" required><select name="ageClass" defaultValue={item?.age_class??"young"}><option value="young">jung</option><option value="old">alt</option><option value="mixed">gemischt</option></select></Field>
    <Field label="Ringnummer" name="ringNumber" defaultValue={item?.ring_number}/>
    <Field label="Käfig-/Katalognummer" name="cageNumber" defaultValue={item?.cage_number??""}/>
    <FormActions cancel={`/aussteller/${exhibitorId}`}/>
  </form>
}
