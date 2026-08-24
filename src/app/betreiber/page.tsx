import { Building2,CheckCircle2,PauseCircle,ShieldX } from "lucide-react";
import { OperatorClubList } from "@/components/operator-club-list";
import { PageHeader } from "@/components/ui";
import { requireOperator } from "@/lib/club-context";
import { getClubs,getOperatorSummary } from "@/lib/data";
export const dynamic="force-dynamic";
export default async function Page(){await requireOperator();const[summary,clubs]=await Promise.all([getOperatorSummary(),getClubs()]);const cards=[{label:"Registrierte Vereine",value:summary.total,icon:Building2},{label:"Aktive Vereine",value:summary.active,icon:CheckCircle2},{label:"Deaktivierte Vereine",value:summary.inactive,icon:PauseCircle},{label:"Gesperrte Vereine",value:summary.blocked,icon:ShieldX}];return <><PageHeader title="Betreiberübersicht" description="Globale Plattformkennzahlen und registrierte Vereinsmandanten"/><section className="stats">{cards.map(({label,value,icon:Icon})=><div className="stat-card" key={label}><span className="stat-icon"><Icon size={21}/></span><div><strong>{value}</strong><span>{label}</span></div></div>)}</section><section><h2>Alle Vereine</h2><OperatorClubList rows={clubs}/></section></>}
