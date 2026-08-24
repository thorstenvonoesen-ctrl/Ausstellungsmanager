CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  address text NOT NULL DEFAULT '',
  contact_person text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exhibitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
  title text NOT NULL,
  venue text NOT NULL,
  venue_address text NOT NULL DEFAULT '',
  starts_at date NOT NULL,
  ends_at date NOT NULL,
  registration_deadline date NOT NULL,
  status text NOT NULL DEFAULT 'Entwurf' CHECK (status IN ('Entwurf','Geplant','Meldung offen','Meldung geschlossen','Laufend','Abgeschlossen','Abgesagt')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exhibition_date_order CHECK (ends_at >= starts_at)
);

CREATE TABLE IF NOT EXISTS exhibitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
  first_name text NOT NULL,
  last_name text NOT NULL,
  street text NOT NULL DEFAULT '',
  house_number text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  association_name text NOT NULL DEFAULT '',
  membership_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS animal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id uuid NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  exhibitor_id uuid NOT NULL REFERENCES exhibitors(id) ON DELETE RESTRICT,
  species text NOT NULL,
  breed text NOT NULL,
  color text NOT NULL DEFAULT '',
  sex text NOT NULL CHECK (sex IN ('1,0','0,1','unbekannt')),
  birth_year integer NOT NULL CHECK (birth_year BETWEEN 1900 AND 2200),
  ring_number text NOT NULL,
  cage_number text,
  entry_fee numeric(10,2) NOT NULL DEFAULT 0 CHECK (entry_fee >= 0),
  status text NOT NULL DEFAULT 'Gemeldet' CHECK (status IN ('Gemeldet','Bestätigt','Abgemeldet','Bewertet')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exhibitions_club ON exhibitions(club_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_exhibitors_club ON exhibitors(club_id);
CREATE INDEX IF NOT EXISTS idx_exhibitors_name ON exhibitors(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_animal_entries_exhibition ON animal_entries(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_animal_entries_exhibitor ON animal_entries(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_animal_entries_breed ON animal_entries(breed);
