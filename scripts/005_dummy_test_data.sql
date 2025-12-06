-- Dummy data untuk pengetesan fitur aplikasi
-- Jalankan setelah migrasi dasar dan seed awal selesai

-- Item tambahan untuk variasi stok
INSERT INTO items (id, name, category, stock, min_stock, price, unit, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-00000000a001', 'Filter Udara Racing', 'Sparepart', 40, 8, 85000, 'Pcs', NOW(), NOW()),
  ('00000000-0000-0000-0000-00000000a002', 'Oli Synthetic Racing', 'Oli', 60, 12, 110000, 'Liter', NOW(), NOW()),
  ('00000000-0000-0000-0000-00000000a003', 'Kampas Kopling Set', 'Sparepart', 12, 4, 420000, 'Set', NOW(), NOW()),
  ('00000000-0000-0000-0000-00000000a004', 'Baut Stainless Set', 'Accessories', 200, 30, 7000, 'Pcs', NOW(), NOW()),
  ('00000000-0000-0000-0000-00000000a005', 'Cairan Pembersih Karburator', 'Cairan', 25, 6, 38000, 'Botol', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Unit dummy mencakup beragam layanan dan status
INSERT INTO units (
  id, vehicle_type, brand, owner_name, phone, service_type, status,
  check_in_date, check_out_date, estimated_cost, final_cost, notes,
  created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-00000000b001', 'Matic', 'Honda Vario 160', 'Dedi Kurniawan', '081233344455', 'servis', 'selesai',
    CURRENT_DATE - INTERVAL '7 day', CURRENT_DATE - INTERVAL '4 day', 250000, 275000, 'Servis lengkap + upgrade CVT', NOW(), NOW()),
  ('00000000-0000-0000-0000-00000000b002', 'Sport', 'Yamaha MT-25', 'Rina Hartati', '082211445566', 'vapor', 'proses',
    CURRENT_DATE - INTERVAL '3 day', NULL, 550000, NULL, 'Vapor velg & blok mesin', NOW(), NOW()),
  ('00000000-0000-0000-0000-00000000b003', 'Trail', 'Kawasaki KLX 150', 'Fajar Nugraha', '081299988877', 'sandblasting', 'check-in',
    CURRENT_DATE - INTERVAL '1 day', NULL, 750000, NULL, 'Persiapan repaint rangka', NOW(), NOW()),
  ('00000000-0000-0000-0000-00000000b004', 'Sport', 'Honda CBR250RR', 'Andre Silalahi', '085211223344', 'restorasi', 'proses',
    CURRENT_DATE - INTERVAL '10 day', NULL, 4800000, NULL, 'Restorasi fairing & mesin', NOW(), NOW()),
  ('00000000-0000-0000-0000-00000000b005', 'Matic', 'Yamaha Aerox', 'Lina Marlina', '087812341234', 'servis', 'check-out',
    CURRENT_DATE - INTERVAL '6 day', CURRENT_DATE - INTERVAL '1 day', 320000, 310000, 'Tune up ringan + ganti kampas', NOW(), NOW()),
  ('00000000-0000-0000-0000-00000000b006', 'Bebek', 'Suzuki Satria FU', 'Robby Hadi', '085700011122', 'servis', 'selesai',
    CURRENT_DATE - INTERVAL '4 day', CURRENT_DATE - INTERVAL '2 day', 210000, 230000, 'Penggantian rantai + sprocket', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Transaksi stok untuk menguji perhitungan masuk/keluar
INSERT INTO stock_transactions (
  id, item_id, item_name, type, quantity, date, note, created_at
) VALUES
  ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000a001', 'Filter Udara Racing', 'masuk', 20, CURRENT_DATE - INTERVAL '12 day', 'Restock filter performa', NOW()),
  ('00000000-0000-0000-0000-00000000c002', '00000000-0000-0000-0000-00000000a001', 'Filter Udara Racing', 'keluar', 8, CURRENT_DATE - INTERVAL '6 day', 'Dipakai servis Aerox & Vario', NOW()),
  ('00000000-0000-0000-0000-00000000c003', '00000000-0000-0000-0000-00000000a002', 'Oli Synthetic Racing', 'masuk', 40, CURRENT_DATE - INTERVAL '9 day', 'Pembelian oli full synthetic', NOW()),
  ('00000000-0000-0000-0000-00000000c004', '00000000-0000-0000-0000-00000000a002', 'Oli Synthetic Racing', 'keluar', 18, CURRENT_DATE - INTERVAL '2 day', 'Dipakai paket servis premium', NOW()),
  ('00000000-0000-0000-0000-00000000c005', '00000000-0000-0000-0000-00000000a003', 'Kampas Kopling Set', 'masuk', 6, CURRENT_DATE - INTERVAL '8 day', 'Persiapan job restorasi', NOW()),
  ('00000000-0000-0000-0000-00000000c006', '00000000-0000-0000-0000-00000000a003', 'Kampas Kopling Set', 'keluar', 2, CURRENT_DATE - INTERVAL '3 day', 'Penggantian kopling CBR250RR', NOW()),
  ('00000000-0000-0000-0000-00000000c007', '00000000-0000-0000-0000-00000000a004', 'Baut Stainless Set', 'masuk', 120, CURRENT_DATE - INTERVAL '5 day', 'Stok baut variasi', NOW()),
  ('00000000-0000-0000-0000-00000000c008', '00000000-0000-0000-0000-00000000a004', 'Baut Stainless Set', 'keluar', 45, CURRENT_DATE - INTERVAL '1 day', 'Restorasi CBR dan KLX', NOW()),
  ('00000000-0000-0000-0000-00000000c009', '00000000-0000-0000-0000-00000000a005', 'Cairan Pembersih Karburator', 'masuk', 15, CURRENT_DATE - INTERVAL '11 day', 'Persiapan paket tune up', NOW()),
  ('00000000-0000-0000-0000-00000000c00a', '00000000-0000-0000-0000-00000000a005', 'Cairan Pembersih Karburator', 'keluar', 5, CURRENT_DATE - INTERVAL '4 day', 'Tune up Satria & Beat', NOW())
ON CONFLICT (id) DO NOTHING;
