import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { getViewerSession } from "@/lib/club-context";
export const dynamic="force-dynamic";
export default async function Page(){const session=await getViewerSession();if(session)redirect(session.isOperator?"/vereine":"/");return <div className="selection-shell"><div className="selection-head"><span className="brand-mark"><Building2 size={22}/></span><div><h1>Vereinszugang</h1><p>Nach der Anmeldung wird automatisch der Ihrem Benutzer zugeordnete Verein geladen.</p></div></div><div className="empty"><h3>Noch nicht angemeldet</h3><p>Melden Sie sich an oder registrieren Sie Ihren Verein, um einen eigenen Vereinsbereich zu erhalten.</p><div className="public-actions"><Link className="button primary" href="/verein-login">Zum Vereinslogin</Link><Link className="button secondary" href="/verein-registrieren">Verein registrieren</Link></div></div></div>}
