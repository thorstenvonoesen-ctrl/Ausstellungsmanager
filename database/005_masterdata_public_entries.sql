ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS house_number text;

CREATE TABLE IF NOT EXISTS masterdata_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  created_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  unchanged_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  imported_by uuid REFERENCES club_users(id) ON DELETE SET NULL,
  imported_at timestamptz NOT NULL DEFAULT now()
);
