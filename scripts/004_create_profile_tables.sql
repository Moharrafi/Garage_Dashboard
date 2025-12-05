-- Profiles table for admin settings
CREATE TABLE IF NOT EXISTS admin_profiles (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(255) NOT NULL,
  full_name VARCHAR(191) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  workshop_name VARCHAR(191),
  role ENUM('admin','staff','owner') NOT NULL DEFAULT 'staff',
  avatar_url TEXT,
  join_date DATE DEFAULT (CURRENT_DATE),
  notify_email TINYINT(1) DEFAULT 1,
  notify_push TINYINT(1) DEFAULT 1,
  notify_stock_alert TINYINT(1) DEFAULT 1,
  notify_unit_complete TINYINT(1) DEFAULT 1,
  notify_daily_report TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications table linked to profile
CREATE TABLE IF NOT EXISTS admin_notifications (
  id CHAR(36) PRIMARY KEY,
  profile_id CHAR(36) NOT NULL,
  title VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_notifications_profile
    FOREIGN KEY (profile_id) REFERENCES admin_profiles(id)
    ON DELETE CASCADE
);
