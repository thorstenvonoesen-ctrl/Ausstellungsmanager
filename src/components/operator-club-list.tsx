import Link from "next/link";
import { ClubOperatorActions } from "@/components/club-operator-actions";
import { Status } from "@/components/ui";
import type { Club } from "@/lib/types";
const labels={active:"Aktiv",inactive:"Inaktiv",blocked:"Gesperrt"} as const;
export function OperatorClubList({rows}:{rows:Club[]}){return <div className="table-card"><div className="table-wrap"><table><thead><tr><th>Verein</th><th>Status</th><th>Ansprechpartner</th><th>E-Mail</th><th>Registriert seit</th><th/></tr></thead><tbody>{rows.map(c=>{const status=c.status??(c.active?"active":"inactive");return <tr key={c.id}><td><Link className="primary-cell" href={`/betreiber/vereine/${c.id}`}>{c.name}</Link><span className="sub">{c.short_name||"Ohne Kurzname"}</span></td><td><Status>{labels[status]}</Status></td><td>{c.contact_person||"–"}</td><td>{c.email||"–"}</td><td>{new Date(c.created_at).toLocaleDateString("de-DE")}</td><td><ClubOperatorActions id={c.id} status={status}/></td></tr>})}</tbody></table></div></div>}
