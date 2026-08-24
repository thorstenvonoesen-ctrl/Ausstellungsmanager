import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import { getViewerSession } from "@/lib/club-context";
import "./globals.css";
import "./tenant.css";

export const metadata:Metadata={title:{default:"Ausstellungsmanager",template:"%s | Ausstellungsmanager"},description:"Organisation von Rassegeflügelausstellungen"};
export default async function RootLayout({children}:{children:React.ReactNode}){const session=await getViewerSession();const viewer=session?{clubName:session.club?.name??"Plattformbetreiber",email:session.email,isOperator:session.isOperator}:null;return <html lang="de"><body><Sidebar viewer={viewer}/><main className={session?"main":"main public-main"}>{children}</main></body></html>}
