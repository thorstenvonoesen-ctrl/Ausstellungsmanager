export type Club = { id: string; name: string; short_name: string; address: string; street: string; postal_code: string; city: string; contact_person: string; email: string; phone: string; logo_url: string | null; active: boolean; status?: "active"|"inactive"|"blocked"; created_at: string };
export type Exhibition = { id: string; club_id: string; club_name: string; title: string; venue: string; venue_address: string; venue_street: string; venue_postal_code: string; venue_city: string; starts_at: string; ends_at: string; delivery_at: string; judging_at: string; collection_at: string; registration_deadline: string; status: string; public_slug: string; description: string; exhibitor_count:number; animal_count:number; created_at: string };
export type Exhibitor = { id: string; show_id: string; show_title: string; club_id: string; club_name: string; first_name: string; last_name: string; street: string; house_number: string; postal_code: string; city: string; email: string; phone: string; association_name: string; membership_number: string | null; age_group: string; created_at: string };
export type AnimalEntry = { id: string; entry_id: string; exhibition_id: string; exhibition_title: string; exhibitor_id: string; exhibitor_name: string; breed_variant_id: string; species: string; breed: string; color: string; sex: string; birth_year: number; age_class: string; ring_number: string; cage_number: string | null; entry_fee: string; status: string; created_at: string };
export type BreedVariant = { id: string; breed: string; color: string };
export type MasterdataOption={id:string;name:string;parent_id?:string;variant_id?:string};
export type MasterdataHierarchy={categories:MasterdataOption[];groups:MasterdataOption[];breeds:MasterdataOption[];colors:MasterdataOption[]};
export type ShowFee={id:string;name:string;fee_type:string;amount:string;youth_amount:string|null;mandatory:boolean;active:boolean;sort_order:number};
export type ShowSection={id:string;name:string};
export type PublicShow={id:string;club_id:string;title:string;venue:string;registration_deadline:string;status:string;club_name:string;club_active:boolean;fees:ShowFee[];sections:ShowSection[]};
export type EntryWorkflowStatus="received"|"reviewed"|"question"|"cancelled";
export type PaymentStatus="open"|"partial"|"paid";
export type ManagedEntry={
  id:string;show_id:string;show_title:string;exhibitor_id:string;exhibitor_number:number|null;
  registration_number:string;submitted_at:string;workflow_status:EntryWorkflowStatus;
  first_name:string;last_name:string;street:string;house_number:string;postal_code:string;city:string;
  email:string;phone:string;livestock_number:string;association_name:string;age_group:string;
  single_count:number;aviary_count:number;stem_count:number;animal_count:number;
  total_amount:string;paid_amount:string;remaining_amount:string;payment_status:PaymentStatus;
  paid_at:string|null;payment_method:string|null;
};
export type ManagedAnimal={
  id:string;entry_id:string;show_id:string;exhibitor_number:number|null;exhibitor_name:string;
  category:string;breed_group:string;breed:string;color:string;breed_variant_id:string;
  category_sort:number;group_sort:number;breed_sort:number;color_sort:number;
  species:string;sex:string;age_class:string;ring_number:string;cage_number:string|null;
  catalog_number:number|null;withdrawn:boolean;status:string;
};
export type EntryFeeItem={id:string;description:string;fee_type:string;quantity:string;unit_amount:string;total_amount:string};
