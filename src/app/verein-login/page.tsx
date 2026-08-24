import Link from "next/link";
import { redirect } from "next/navigation";
import { loginClub } from "@/app/actions";
import { Field } from "@/components/ui";
import { getViewerSession } from "@/lib/club-context";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){const session=await getViewerSession();if(session)redirect(session.isOperator?"/betreiber":"/");const{error}=await searchParams;return <div className="auth-shell compact"><div className="auth-intro"><span>Geschützter Zugang</span><h1>Vereinslogin</h1><p>Melden Sie sich mit dem bei der Registrierung angelegten Vereinszugang an.</p></div>{error?<p className="form-error">E-Mail-Adresse oder Passwort sind nicht korrekt, oder der Zugang ist gesperrt.</p>:null}<form action={loginClub} className="form-card form-grid"><Field label="E-Mail" name="email" type="email" required wide/><Field label="Passwort" name="password" type="password" required wide/><div className="form-actions"><Link className="button secondary" href="/verein-registrieren">Verein registrieren</Link><button className="button primary" type="submit">Anmelden</button></div></form></div>}
