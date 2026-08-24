import Link from "next/link";
export default function NotFound(){return <div className="error-card"><h1>Nicht gefunden</h1><p>Der angeforderte Datensatz existiert nicht.</p><Link className="button primary" href="/">Zur Übersicht</Link></div>}
