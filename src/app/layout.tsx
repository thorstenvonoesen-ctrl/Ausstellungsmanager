import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import { getActiveClub } from "@/lib/club-context";
import "./globals.css";
import "./tenant.css";

export const metadata:Metadata={title:{default:"Ausstellungsmanager",template:"%s | Ausstellungsmanager"},description:"Organisation von Rassegeflügelausstellungen"};
export default async function RootLayout({children}:{children:React.ReactNode}){const club=await getActiveClub();return <html lang="de"><body><Sidebar activeClub={club?{name:club.name,shortName:club.short_name}:null}/><main className="main">{children}</main></body></html>}
