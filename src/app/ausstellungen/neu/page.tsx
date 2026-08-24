import{ExhibitionForm}from"@/components/exhibition-form";import{FormHeader}from"@/components/ui";import{requireActiveClub}from"@/lib/club-context";
export const dynamic="force-dynamic";export default async function Page(){const club=await requireActiveClub();return <div className="form-shell"><FormHeader title="Neue Ausstellung" back="/ausstellungen"/><ExhibitionForm club={club}/></div>}
