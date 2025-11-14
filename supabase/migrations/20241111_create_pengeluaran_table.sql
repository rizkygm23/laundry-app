-- Create pengeluaran table for expense tracking
CREATE TABLE IF NOT EXISTS pengeluaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_users uuid REFERENCES users(id) ON DELETE SET NULL,
  kategori text NOT NULL,
  deskripsi text NOT NULL,
  jumlah integer NOT NULL DEFAULT 0,
  tanggal timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pengeluaran ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pengeluaran
CREATE POLICY "Anyone can view pengeluaran"
  ON pengeluaran FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert pengeluaran"
  ON pengeluaran FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update pengeluaran"
  ON pengeluaran FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete pengeluaran"
  ON pengeluaran FOR DELETE
  USING (true);

-- Add comment
COMMENT ON TABLE pengeluaran IS 'Tabel untuk mencatat pengeluaran usaha laundry';
COMMENT ON COLUMN pengeluaran.kategori IS 'Kategori pengeluaran (contoh: Operasional, Bahan Baku, Gaji, dll)';
COMMENT ON COLUMN pengeluaran.deskripsi IS 'Deskripsi detail pengeluaran';
COMMENT ON COLUMN pengeluaran.jumlah IS 'Jumlah pengeluaran dalam rupiah';

