ALTER TABLE club_users DROP CONSTRAINT IF EXISTS club_users_role_check;
ALTER TABLE club_users ADD CONSTRAINT club_users_role_check CHECK (
  role IN ('club_admin','show_manager','cashier','registration_office','judge','viewer','operator')
);
