import Link from "next/link";
import { ClubOperatorActions } from "@/components/club-operator-actions";
import { getClubs } from "@/lib/data";
import { EmptyState,PageHeader,Status } from "@/components/ui";
import { requireOperator } from "@/lib/club-context";
export const dynamic="force-dynamic";
const labels={active:"Aktiv",inactive:"Inaktiv",blocked:"Gesperrt"} as const;
export default async function Page(){await requireOperator();const rows=await getClubs();return <><PageHeader title="Betreiberverwaltung · Vereine" description="Registrierte Vereine prüfen, freischalten, deaktivieren oder sperren"/>{rows.length===0?<EmptyState title="Noch keine Registrierung" text="Vereine erscheinen hier, sobald sie sich öffentlich registriert haben." href="/verein-registrieren" label="Öffentliche Registrierung ansehen"/>:<div className="table-card"><div className="table-wrap"><table><thead><tr><th>Verein</th><th>Status</th><th>Ansprechpartner</th><th>Kontakt</th><th/></tr></thead><tbody>{rows.map(c=>{const status=c.status??(c.active?"active":"inactive");return <tr key={c.id}><td><Link className="primary-cell" href={`/vereine/${c.id}`}>{c.name}</Link><span className="sub">{c.short_name||"Ohne Kurzname"}</span></td><td><Status>{labels[status]}</Status></td><td>{c.contact_person||"–"}</td><td>{c.email||c.phone||"–"}</td><td><ClubOperatorActions id={c.id} status={status}/></td></tr>})}</tbody></table></div></div>}</>}
