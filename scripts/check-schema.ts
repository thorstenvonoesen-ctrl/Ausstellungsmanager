import { neon } from "@neondatabase/serverless";

const expected: Record<string, string[]> = {
  clubs: ["id", "name", "short_name", "address", "contact_person", "email", "phone", "logo_url", "created_at"],
  exhibitions: ["id", "club_id", "title", "venue", "venue_address", "starts_at", "ends_at", "registration_deadline", "status", "description", "created_at"],
  exhibitors: ["id", "club_id", "first_name", "last_name", "street", "house_number", "postal_code", "city", "email", "phone", "association_name", "membership_number", "created_at"],
  animal_entries: ["id", "exhibition_id", "exhibitor_id", "species", "breed", "color", "sex", "birth_year", "ring_number", "cage_number", "entry_fee", "status", "created_at"],
};

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL ist nicht gesetzt.");

  const sql = neon(databaseUrl);
  const rows = await sql`
    SELECT table_schema, table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name, ordinal_position
  `;

  const available = new Map<string, Set<string>>();
  const columnTypes = new Map<string, string[]>();
  for (const row of rows) {
    const key = `${String(row.table_schema)}.${String(row.table_name)}`;
    const columns = available.get(key) ?? new Set<string>();
    columns.add(String(row.column_name));
    available.set(key, columns);
    const types = columnTypes.get(key) ?? [];
    types.push(`${String(row.column_name)}:${String(row.data_type)}`);
    columnTypes.set(key, types);
  }

  let valid = true;
  for (const [table, columns] of Object.entries(expected)) {
    const actual = available.get(`public.${table}`);
    if (!actual) {
      valid = false;
      console.error(`[schema] Tabelle public.${table} fehlt.`);
      continue;
    }
    const missing = columns.filter((column) => !actual.has(column));
    if (missing.length) {
      valid = false;
      console.error(`[schema] public.${table}: fehlende Spalten: ${missing.join(", ")}`);
    }
  }

  if (!valid) {
    console.error("[schema] Vorhandene Anwendungstabellen:", [...available.keys()].join(", "));
    for (const table of ["public.clubs", "public.shows", "public.exhibitors", "public.entries", "public.animals", "public.breed_color_variants", "public.breeds", "public.color_variants"]) {
      const columns = columnTypes.get(table);
      if (columns) console.error(`[schema] ${table}: ${columns.join(", ")}`);
    }
    process.exitCode = 1;
  } else {
    console.log("Datenbankschema entspricht den vom Anwendungscode erwarteten Tabellen und Spalten.");
  }
}

main().catch((error) => {
  console.error("[schema] Prüfung fehlgeschlagen:", error);
  process.exitCode = 1;
});
