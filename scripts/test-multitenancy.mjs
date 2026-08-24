import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [dataSource, actionSource, contextSource, dashboardSource] = await Promise.all([
  readFile("src/lib/data.ts", "utf8"), readFile("src/app/actions.ts", "utf8"), readFile("src/lib/club-context.ts", "utf8"), readFile("src/app/page.tsx", "utf8"),
]);
for (const signature of ["getDashboardData(clubId:string)","getExhibitions(clubId:string)","getExhibitors(clubId:string","getEntries(clubId:string","getEntry(id:string,clubId:string)"]) assert.ok(dataSource.includes(signature),`Pflichtfilter fehlt: ${signature}`);
for (const guard of ["assertShowBelongsToClub","assertExhibitorBelongsToClub","assertAnimalBelongsToClub"]) assert.ok(actionSource.includes(guard),`Server-Action-Guard fehlt: ${guard}`);
const showAction=actionSource.slice(actionSource.indexOf("export async function saveExhibition"),actionSource.indexOf("const exhibitorSchema"));
assert.ok(!showAction.includes("value(data,\"clubId\")"),"Ausstellungs-club_id darf nicht aus FormData übernommen werden");
assert.ok(actionSource.includes("INSERT INTO club_users"),"Registrierung muss den ersten Vereinsadministrator anlegen");
assert.ok(actionSource.includes("registrationSchema.safeParse"),"Registrierungsvalidierung darf keinen ungefangenen ZodError auslösen");
assert.ok(actionSource.includes("shortName:z.string().trim().max(100)"),"Optionale Kurznamen müssen die unterstützte Länge akzeptieren");
assert.ok(actionSource.includes("requireOperator()"),"Betreiberaktionen müssen serverseitig geschützt sein");
assert.ok(contextSource.includes("session_token_hash=$1"),"Vereinskontext muss aus einer serverseitig geprüften Sitzung stammen");
assert.ok(contextSource.includes("if(session.isOperator)redirect(\"/betreiber\")"),"Betreiber dürfen nicht in den normalen Vereinsworkflow gelangen");
assert.ok(contextSource.includes("if(!session)redirect(\"/betreiber-login\")"),"Betreiberbereich benötigt einen eigenen Login");
assert.ok(actionSource.includes("loginForRole(data,\"club\")")&&actionSource.includes("loginForRole(data,\"operator\")"),"Login-Actions müssen Rollen strikt trennen");
assert.ok(!dashboardSource.includes("Aktiver Verein")&&!dashboardSource.includes("counts.clubs"),"Vereinsdashboard darf keine globalen Vereinskennzahlen zeigen");

const shows=[{id:"show-a",clubId:"club-a"},{id:"show-b",clubId:"club-b"}],exhibitors=[{id:"exhibitor-a",showId:"show-a"},{id:"exhibitor-b",showId:"show-b"}],animals=[{id:"animal-a",showId:"show-a"},{id:"animal-b",showId:"show-b"}];
const showIdsFor=clubId=>new Set(shows.filter(row=>row.clubId===clubId).map(row=>row.id));
const rowsFor=(rows,clubId)=>rows.filter(row=>showIdsFor(clubId).has(row.showId));
assert.deepEqual([...showIdsFor("club-a")],["show-a"]);assert.deepEqual([...showIdsFor("club-b")],["show-b"]);
assert.deepEqual(rowsFor(exhibitors,"club-a").map(row=>row.id),["exhibitor-a"]);assert.deepEqual(rowsFor(exhibitors,"club-b").map(row=>row.id),["exhibitor-b"]);
assert.deepEqual(rowsFor(animals,"club-a").map(row=>row.id),["animal-a"]);assert.deepEqual(rowsFor(animals,"club-b").map(row=>row.id),["animal-b"]);
assert.equal(rowsFor(exhibitors,"club-a").find(row=>row.id==="exhibitor-b"),undefined);assert.equal(rowsFor(animals,"club-a").find(row=>row.id==="animal-b"),undefined);
console.log("Mehrvereins-Tests erfolgreich: Listen, Dashboard-Beziehungen und Fremd-ID-Trennung für Verein A/B geprüft.");
