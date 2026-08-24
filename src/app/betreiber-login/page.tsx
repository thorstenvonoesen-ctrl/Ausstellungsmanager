import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { loginOperator } from "@/app/actions";
import { Field } from "@/components/ui";
import { getViewerSession } from "@/lib/club-context";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){const session=await getViewerSession();if(session)redirect(session.isOperator?"/betreiber":"/");const{error}=await searchParams;return <div className="auth-shell compact operator-login"><div className="auth-intro"><ShieldCheck size={28}/><span>Plattformverwaltung</span><h1>Betreiberlogin</h1><p>Dieser Zugang ist ausschließlich für autorisierte Plattformbetreiber.</p></div>{error?<p className="form-error">Die Zugangsdaten sind nicht korrekt oder gehören nicht zu einem Betreiberkonto.</p>:null}<form action={loginOperator} className="form-card form-grid"><Field label="E-Mail" name="email" type="email" required wide/><Field label="Passwort" name="password" type="password" required wide/><div className="form-actions"><Link className="button secondary" href="/">Zur Startseite</Link><button className="button primary" type="submit">Als Betreiber anmelden</button></div></form></div>}
