import{saveExhibition}from"@/app/actions";
import{Field,FormActions}from"@/components/ui";
import type{Club,Exhibition,ShowFee}from"@/lib/types";

const statuses=[{value:"draft",label:"Entwurf"},{value:"registration_open",label:"Meldung offen"},{value:"registration_closed",label:"Meldung geschlossen"},{value:"judging",label:"Bewertung"},{value:"completed",label:"Abgeschlossen"}];
const localDateTime=(value?:string)=>value?value.replace(" ","T").slice(0,16):"";
function EuroField({label,name,value,required=false}:{label:string;name:string;value:string;required?:boolean}){return <Field label={label} name={name} type="number" min="0" step="0.01" defaultValue={value} required={required}/>}

export function ExhibitionForm({club,item,fees=[],error}:{club:Club;item?:Exhibition;fees?:ShowFee[];error?:string}){
  const message=error==="validation"?"Bitte prüfen Sie die Pflichtfelder, Datumsreihenfolge, Gebühren und den Status.":error?"Die Ausstellung konnte nicht gespeichert werden. Der Fehler wurde serverseitig protokolliert.":null;
  const fee=(type:string)=>fees.find(value=>value.fee_type===type&&value.active)??fees.find(value=>value.fee_type===type);
  return <>{message?<p className="form-error">{message}</p>:null}<form action={saveExhibition} className="form-card form-grid">
    <input type="hidden" name="id" value={item?.id??""}/><div className="field"><span>Verein</span><strong>{club.name}</strong></div>
    <Field label="Titel" name="title" defaultValue={item?.title} required/><Field label="Veranstaltungsort" name="venue" defaultValue={item?.venue}/>
    <Field label="Straße Veranstaltungsort" name="venueStreet" defaultValue={item?.venue_street}/><Field label="PLZ Veranstaltungsort" name="venuePostalCode" defaultValue={item?.venue_postal_code}/><Field label="Ort Veranstaltungsort" name="venueCity" defaultValue={item?.venue_city}/>
    <Field label="Beginn" name="startsAt" type="datetime-local" defaultValue={localDateTime(item?.starts_at)} required/><Field label="Ende" name="endsAt" type="datetime-local" defaultValue={localDateTime(item?.ends_at)} required/>
    <Field label="Einlieferung (optional)" name="deliveryAt" type="datetime-local" defaultValue={localDateTime(item?.delivery_at)}/><Field label="Bewertung (optional)" name="judgingAt" type="datetime-local" defaultValue={localDateTime(item?.judging_at)}/><Field label="Abholung (optional)" name="collectionAt" type="datetime-local" defaultValue={localDateTime(item?.collection_at)}/>
    <Field label="Meldeschluss" name="deadline" type="datetime-local" defaultValue={localDateTime(item?.registration_deadline)} required/><Field label="Status" name="status" required><select name="status" defaultValue={item?.status??"draft"}>{statuses.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
    <Field label="Beschreibung" name="description" wide><textarea name="description" defaultValue={item?.description}/></Field>
    <fieldset className="fee-section wide"><legend>Standgelder und Kosten</legend><p>Diese Beträge gelten ausschließlich für diese Ausstellung und erscheinen automatisch im öffentlichen Meldeformular.</p><div className="fee-grid">
      <EuroField label="Standgeld Einzeltier (€)" name="animalFee" value={fee("animal")?.amount??"0.00"} required/><EuroField label="Standgeld Stamm (€)" name="stemFee" value={fee("stem")?.amount??"0.00"}/>
      <EuroField label="Standgeld Voliere (€)" name="aviaryFee" value={fee("aviary")?.amount??"0.00"}/><div className="fee-with-option"><EuroField label="Katalog (€)" name="catalogFee" value={fee("catalog")?.amount??"0.00"}/><label className="terms"><input type="checkbox" name="catalogMandatory" defaultChecked={fee("catalog")?.mandatory??false}/>Katalog verpflichtend</label></div>
      <div className="fee-with-option"><EuroField label="Unkostenbeitrag (€)" name="expensesFee" value={fee("expenses")?.amount??"0.00"}/><label className="terms"><input type="checkbox" name="expensesMandatory" defaultChecked={fee("expenses")?.mandatory??false}/>Unkostenbeitrag verpflichtend</label></div><EuroField label="Jugendpreis Einzeltier (€), optional" name="youthAnimalFee" value={fee("animal")?.youth_amount??""}/>
      <EuroField label="Jugendpreis Stamm (€), optional" name="youthStemFee" value={fee("stem")?.youth_amount??""}/><EuroField label="Jugendpreis Voliere (€), optional" name="youthAviaryFee" value={fee("aviary")?.youth_amount??""}/>
    </div></fieldset><FormActions cancel="/ausstellungen"/>
  </form></>;
}
