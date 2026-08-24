# Ausstellungsmanager

Webanwendung zur Organisation von Rassegeflügelausstellungen. Die erste Version verwaltet Vereine, Ausstellungen, Aussteller und Tiermeldungen in einer Neon-PostgreSQL-Datenbank.

## Technik

- Next.js (App Router), React und TypeScript
- Neon PostgreSQL über `DATABASE_URL`
- ausschließlich serverseitige Datenbankabfragen
- Server Actions mit Zod-Validierung

## Lokal starten

Voraussetzung ist Node.js 20 oder neuer.

```bash
npm install
cp .env.example .env.local
# DATABASE_URL in .env.local eintragen
npm run db:migrate
npm run dev
```

Die Anwendung läuft danach unter `http://localhost:3000`.

## Datenbank

Die reproduzierbare Initialmigration liegt unter `database/001_initial.sql`. Sie erzeugt Tabellen, Fremdschlüssel, Prüfbedingungen und Indizes. Die Migration kann mit `npm run db:migrate` ausgeführt werden. Es werden keine Beispieldaten angelegt.

Auf Vercel muss `DATABASE_URL` für die gewünschten Umgebungen gesetzt sein. Datenbank-URLs gehören nicht in das Repository; `.env*` wird ignoriert.

## Prüfung

```bash
npm run typecheck
npm run lint
npm run build
```
Mehrvereinsfähige Webanwendung zur Verwaltung von Rassegeflügelausstellungen
