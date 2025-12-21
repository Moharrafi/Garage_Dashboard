-- =========================================
-- MySQL 8+ schema: items, stock_transactions, units
-- =========================================

-- 1) ITEMS (stock master)
CREATE TABLE IF NOT EXISTS items (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  name TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 0,
  price INT NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Auto-update updated_at (MySQL way)
CREATE TRIGGER trg_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;


-- 2) STOCK TRANSACTIONS (stock in/out log)
CREATE TABLE IF NOT EXISTS stock_transactions (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  item_id CHAR(36) NOT NULL,
  item_name TEXT NOT NULL,
  type ENUM('masuk','keluar') NOT NULL,
  quantity INT NOT NULL,
  `date` DATE NOT NULL,
  note TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_stock_item_id (item_id),
  KEY idx_stock_date (`date`),
  CONSTRAINT fk_stock_item
    FOREIGN KEY (item_id) REFERENCES items(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3) UNITS (workshop check-in/out)
CREATE TABLE IF NOT EXISTS units (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  vehicle_type VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  owner_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  service_type ENUM('servis','vapor','sandblasting','restorasi') NOT NULL,
  status ENUM('check-in','proses','selesai','check-out') NOT NULL DEFAULT 'check-in',
  check_in_date DATE NOT NULL,
  check_out_date DATE NULL,
  estimated_cost INT NOT NULL DEFAULT 0,
  final_cost INT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_units_status (status),
  KEY idx_units_checkin (check_in_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TRIGGER trg_units_updated_at
BEFORE UPDATE ON units
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;
