import { OperatorClubList } from "@/components/operator-club-list";
import { EmptyState,PageHeader } from "@/components/ui";
import { requireOperator } from "@/lib/club-context";
import { getClubs } from "@/lib/data";
export const dynamic="force-dynamic";
export default async function Page(){await requireOperator();const rows=await getClubs();return <><PageHeader title="Vereine" description="Alle selbst registrierten Vereinsmandanten"/>{rows.length?<OperatorClubList rows={rows}/>:<EmptyState title="Noch keine Registrierung" text="Vereine erscheinen hier nach der öffentlichen Registrierung." href="/" label="Zur Startseite"/>}</>}
