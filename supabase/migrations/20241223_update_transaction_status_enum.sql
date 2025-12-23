-- Migration to update allowed values for status_transaksi
-- Adding 'penjemputan' and 'terkirim' to the check constraint

ALTER TABLE "transaksi" DROP CONSTRAINT IF EXISTS "transaksi_status_transaksi_check";

ALTER TABLE "transaksi" 
  ADD CONSTRAINT "transaksi_status_transaksi_check" 
  CHECK (status_transaksi IN ('antrian', 'proses', 'selesai', 'penjemputan', 'terkirim'));
