ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS livestock_number text;

ALTER TABLE entries ADD COLUMN IF NOT EXISTS single_count integer NOT NULL DEFAULT 0;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS aviary_count integer NOT NULL DEFAULT 0;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS stem_count integer NOT NULL DEFAULT 0;

ALTER TABLE animals ADD COLUMN IF NOT EXISTS own_breeding boolean NOT NULL DEFAULT false;
ALTER TABLE animals ADD COLUMN IF NOT EXISTS collection_name text;
ALTER TABLE animals ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE animals ADD COLUMN IF NOT EXISTS sale_price numeric(10,2);

CREATE TABLE IF NOT EXISTS show_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE(show_id,name)
);

CREATE INDEX IF NOT EXISTS idx_show_sections_show ON show_sections(show_id,sort_order);

