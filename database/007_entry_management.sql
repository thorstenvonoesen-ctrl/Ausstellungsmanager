ALTER TABLE entries ADD COLUMN IF NOT EXISTS workflow_status text NOT NULL DEFAULT 'received';
-- next
ALTER TABLE entries ADD COLUMN IF NOT EXISTS exhibitor_number integer;
-- next
ALTER TABLE entries ADD COLUMN IF NOT EXISTS paid_amount numeric(12,2) NOT NULL DEFAULT 0;
-- next
ALTER TABLE entries ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'open';
-- next
ALTER TABLE entries ADD COLUMN IF NOT EXISTS paid_at timestamptz;
-- next
ALTER TABLE entries ADD COLUMN IF NOT EXISTS payment_method text;

-- next
DO $$ BEGIN
  ALTER TABLE entries ADD CONSTRAINT entries_workflow_status_check
    CHECK (workflow_status IN ('received','reviewed','question','cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- next
DO $$ BEGIN
  ALTER TABLE entries ADD CONSTRAINT entries_payment_status_check
    CHECK (payment_status IN ('open','partial','paid'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- next
DO $$ BEGIN
  ALTER TABLE entries ADD CONSTRAINT entries_payment_method_check
    CHECK (payment_method IS NULL OR payment_method IN ('cash','transfer','other'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- next
CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_show_exhibitor_number
  ON entries(show_id,exhibitor_number) WHERE exhibitor_number IS NOT NULL;
-- next
CREATE INDEX IF NOT EXISTS idx_entries_show_workflow ON entries(show_id,workflow_status);
-- next
CREATE INDEX IF NOT EXISTS idx_entries_show_payment ON entries(show_id,payment_status);

-- next
UPDATE entries SET workflow_status='cancelled' WHERE status='cancelled' AND workflow_status<>'cancelled';
