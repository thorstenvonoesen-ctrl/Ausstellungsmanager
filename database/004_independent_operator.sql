ALTER TABLE club_users ALTER COLUMN club_id DROP NOT NULL;

-- Frühere Test-/Übergangskonten werden aus dem Vereinsmandanten gelöst.
-- Vereinsrollen und Vereinsdaten bleiben unverändert.
UPDATE club_users SET club_id = NULL WHERE role = 'operator';

ALTER TABLE club_users DROP CONSTRAINT IF EXISTS club_users_operator_scope_check;
ALTER TABLE club_users ADD CONSTRAINT club_users_operator_scope_check CHECK (
  (role = 'operator' AND club_id IS NULL)
  OR
  (role <> 'operator' AND club_id IS NOT NULL)
);
