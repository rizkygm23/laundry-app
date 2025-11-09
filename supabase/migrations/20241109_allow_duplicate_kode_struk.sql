-- Allow multiple transaksi rows to share the same kode_struk

alter table transaksi
  drop constraint if exists transaksi_kode_struk_key;


