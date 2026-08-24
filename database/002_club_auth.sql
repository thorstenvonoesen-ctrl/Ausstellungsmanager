ALTER TABLE club_users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE club_users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE club_users ADD COLUMN IF NOT EXISTS session_token_hash text;
ALTER TABLE club_users ADD COLUMN IF NOT EXISTS session_expires_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_club_users_email_unique
  ON club_users (lower(email))
  WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_club_users_session_token
  ON club_users (session_token_hash)
  WHERE session_token_hash IS NOT NULL;

