"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bird, Building2, CalendarDays, LayoutDashboard, Users, X } from "lucide-react";
import { useState } from "react";

const links=[{href:"/",label:"Übersicht",icon:LayoutDashboard},{href:"/ausstellungen",label:"Ausstellungen",icon:CalendarDays},{href:"/aussteller",label:"Aussteller",icon:Users},{href:"/tiermeldungen",label:"Tiermeldungen",icon:Bird},{href:"/vereine",label:"Vereine",icon:Building2}];
export function Sidebar(){const path=usePathname();const[open,setOpen]=useState(false);return <><button className="mobile-menu" onClick={()=>setOpen(true)} aria-label="Navigation öffnen">☰</button>{open?<button className="scrim" onClick={()=>setOpen(false)} aria-label="Navigation schließen"/>:null}<aside className={`sidebar ${open?"open":""}`}><div className="brand"><span className="brand-mark"><Bird size={22}/></span><span><strong>Ausstellungsmanager</strong><small>Verwaltungszentrale</small></span><button className="close-menu" onClick={()=>setOpen(false)} aria-label="Navigation schließen"><X/></button></div><nav>{links.map(({href,label,icon:Icon})=>{const active=href==="/"?path===href:path.startsWith(href);return <Link key={href} href={href} onClick={()=>setOpen(false)} className={active?"active":""}><Icon size={19}/>{label}</Link>})}</nav><div className="sidebar-foot"><span className="status-dot"/>System bereit<small>Neon PostgreSQL</small></div></aside></>}
