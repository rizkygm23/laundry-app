/**
 * Test Supabase Connection
 * 
 * Script ini untuk test koneksi ke Supabase dan memverifikasi tabel ada.
 * Jalankan di browser console untuk debug.
 */

import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

  try {
    // Test query ke tabel layanan
    console.log('\n📊 Testing table: layanan');
    const { data: layanan, error: errorLayanan } = await supabase
      .from('layanan_laundry')
      .select('id')
      .limit(1);

    if (errorLayanan) {
      console.error('❌ Error accessing layanan:', errorLayanan);
    } else {
      console.log('✅ Tabel layanan accessible');
    }

    // Test query ke tabel pelanggan
    console.log('\n📊 Testing table: pelanggan');
    const { data: pelanggan, error: errorPelanggan } = await supabase
      .from('pelanggan_laundry')
      .select('id')
      .limit(1);

    if (errorPelanggan) {
      console.error('❌ Error accessing pelanggan:', errorPelanggan);
    } else {
      console.log('✅ Tabel pelanggan accessible');
    }

    // Test query ke tabel transaksi
    console.log('\n📊 Testing table: transaksi');
    const { data: transaksi, error: errorTransaksi } = await supabase
      .from('transaksi_laundry')
      .select('id')
      .limit(1);

    if (errorTransaksi) {
      console.error('❌ Error accessing transaksi:', errorTransaksi);
    } else {
      console.log('✅ Tabel transaksi accessible');
    }

    console.log('\n✅ Connection test completed!');
    return {
      success: !errorLayanan && !errorPelanggan && !errorTransaksi,
      errors: {
        layanan: errorLayanan,
        pelanggan: errorPelanggan,
        transaksi: errorTransaksi,
      },
    };
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return {
      success: false,
      error,
    };
  }
}

// Auto-run in browser console
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}

