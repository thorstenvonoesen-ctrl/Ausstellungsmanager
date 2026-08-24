import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata:Metadata={title:{default:"Ausstellungsmanager",template:"%s | Ausstellungsmanager"},description:"Organisation von Rassegeflügelausstellungen"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body><Sidebar/><main className="main">{children}</main></body></html>}
