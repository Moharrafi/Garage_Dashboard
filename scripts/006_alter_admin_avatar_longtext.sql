-- Ensure avatar images can be stored without truncation
ALTER TABLE admin_profiles
  MODIFY COLUMN avatar_url LONGTEXT NULL;
