-- Add payment method and proof of payment fields to transaksi table
ALTER TABLE transaksi 
ADD COLUMN IF NOT EXISTS metode_pembayaran text CHECK (metode_pembayaran IN ('tunai', 'transfer', 'e_wallet', 'qris')),
ADD COLUMN IF NOT EXISTS bukti_pembayaran_url text;

-- Add comment for documentation
COMMENT ON COLUMN transaksi.metode_pembayaran IS 'Metode pembayaran: tunai, transfer, e_wallet, atau qris';
COMMENT ON COLUMN transaksi.bukti_pembayaran_url IS 'URL bukti pembayaran yang disimpan di Supabase Storage';

