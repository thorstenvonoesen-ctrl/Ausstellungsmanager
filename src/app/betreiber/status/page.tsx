import { OperatorClubList } from "@/components/operator-club-list";
import { PageHeader } from "@/components/ui";
import { requireOperator } from "@/lib/club-context";
import { getClubs } from "@/lib/data";
export const dynamic="force-dynamic";
export default async function Page(){await requireOperator();const rows=await getClubs();return <><PageHeader title="Statusverwaltung" description="Vereine freischalten, deaktivieren oder vollständig sperren"/><OperatorClubList rows={rows}/></>}
