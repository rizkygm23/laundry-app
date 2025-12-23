-- Add membership columns to pelanggan
ALTER TABLE pelanggan ADD COLUMN IF NOT EXISTS poin INTEGER DEFAULT 0;
ALTER TABLE pelanggan ADD COLUMN IF NOT EXISTS membership_level TEXT DEFAULT 'Bronze';

-- Add point tracking columns to transaksi
ALTER TABLE transaksi ADD COLUMN IF NOT EXISTS poin_earned INTEGER DEFAULT 0;
ALTER TABLE transaksi ADD COLUMN IF NOT EXISTS poin_used INTEGER DEFAULT 0;
