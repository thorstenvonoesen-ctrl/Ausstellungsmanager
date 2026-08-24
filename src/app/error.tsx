"use client";
export default function ErrorPage({error,reset}:{error:Error;reset:()=>void}){return <div className="error-card"><h1>Das hat nicht funktioniert</h1><p>{error.message||"Beim Laden der Daten ist ein Fehler aufgetreten."}</p><button className="button primary" onClick={reset}>Erneut versuchen</button></div>}
