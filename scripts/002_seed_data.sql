-- Seed initial items data
INSERT INTO items (name, category, stock, min_stock, price, unit) VALUES
  ('Oli Mesin 10W-40', 'Oli', 50, 10, 45000, 'Liter'),
  ('Kampas Rem Depan', 'Sparepart', 25, 5, 35000, 'Set'),
  ('Busi NGK', 'Sparepart', 100, 20, 25000, 'Pcs'),
  ('Ban Tubeless 70/90', 'Ban', 15, 5, 185000, 'Pcs'),
  ('Rantai Motor', 'Sparepart', 20, 5, 120000, 'Set'),
  ('Aki Motor 5Ah', 'Aki', 10, 3, 250000, 'Pcs'),
  ('Air Radiator', 'Cairan', 30, 10, 15000, 'Liter'),
  ('Minyak Rem DOT 3', 'Cairan', 20, 5, 25000, 'Botol'),
  ('Bubuk Soda Blasting', 'Bubuk', 25, 5, 75000, 'Kg'),
  ('Bubuk Glass Beads', 'Bubuk', 20, 5, 95000, 'Kg')
ON CONFLICT DO NOTHING;

-- Seed initial units data
INSERT INTO units (vehicle_type, brand, owner_name, phone, service_type, status, check_in_date, estimated_cost, notes) VALUES
  ('Matic', 'Honda Beat', 'Ahmad Wijaya', '081234567890', 'servis', 'proses', CURRENT_DATE - INTERVAL '1 day', 150000, 'Ganti oli dan tune up'),
  ('Sport', 'Yamaha R15', 'Budi Santoso', '082345678901', 'vapor', 'check-in', CURRENT_DATE, 350000, 'Vapor blasting velg'),
  ('Trail', 'Honda CRF', 'Eko Prasetyo', '085678901234', 'restorasi', 'proses', CURRENT_DATE - INTERVAL '1 day', 2500000, 'Restorasi full body')
ON CONFLICT DO NOTHING;
