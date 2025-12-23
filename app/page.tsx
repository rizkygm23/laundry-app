'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, MapPin, Phone, Shirt, Droplets, ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import BookingForm from '@/components/booking/BookingForm';
import { supabase } from '@/lib/supabase';

interface Layanan {
  id: string;
  nama: string;
  jenis_layanan: string;
  harga: number;
  durasi_pengerjaan_jam: number;
}

export default function LandingPage() {
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedLayananId, setSelectedLayananId] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bookingFormRef = useRef<HTMLDivElement>(null);

  const categories = ['Semua', 'Kiloan', 'Satuan'];

  const filteredLayanan = layananList.filter(layanan => {
    if (selectedCategory === 'Semua') return true;
    return layanan.jenis_layanan.toLowerCase() === selectedCategory.toLowerCase();
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Width of a card
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleBookingClick = (id: string) => {
    setSelectedLayananId(id);
    if (bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const fetchLayanan = async () => {
    try {
      const { data, error } = await supabase
        .from('layanan')
        .select('*')
        .order('harga', { ascending: true }); // Sort by price or name

      if (error) throw error;
      setLayananList(data || []);
    } catch (err) {
      console.error('Error fetching layanan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">Necis Laundry</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Login buttons removed as requested */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-laundry.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Solusi Laundry <span className="text-blue-200">Cepat & Bersih</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mb-10">
            Percayakan pakaian Anda pada kami. Layanan laundry profesional dengan hasil rapi, wangi, dan higienis. Siap antar jemput ke lokasi Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="#layanan">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50">
                Pesan Layanan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Memilih Kami?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Kami mengutamakan kualitas dan kepuasan pelanggan dengan standar kebersihan tinggi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tepat Waktu</h3>
              <p className="text-gray-600">Jaminan selesai sesuai waktu yang dijanjikan. Layanan express tersedia untuk kebutuhan mendesak.</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bersih & Wangi</h3>
              <p className="text-gray-600">Menggunakan deterjen premium dan pewangi tahan lama untuk menjaga kualitas pakaian Anda.</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Antar Jemput</h3>
              <p className="text-gray-600">Tidak perlu repot keluar rumah. Kami siap menjemput dan mengantar pakaian Anda (Area Terjangkau).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar Layanan */}
      <section id="layanan" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Layanan Kami</h2>
            <p className="text-gray-600">Pilih paket layanan yang sesuai dengan kebutuhan Anda</p>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Category Tabs */}
              <div className="flex justify-center flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`rounded-full px-6 ${selectedCategory === category ? 'bg-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="relative group/scroll">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 h-12 w-12 rounded-full shadow-lg bg-white/90 hidden md:flex opacity-0 group-hover/scroll:opacity-100 transition-opacity"
                  onClick={() => scroll('left')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto gap-4 pb-8 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide py-4"
                >
                  {filteredLayanan.map((layanan) => (
                    <div
                      key={layanan.id}
                      className="block h-auto group min-w-[300px] w-[85vw] sm:w-[350px] snap-center flex-shrink-0"
                      onClick={() => handleBookingClick(layanan.id)}
                    >
                      <Card className="h-full flex flex-col hover:shadow-xl transition-all border-t-4 border-t-blue-600 hover:-translate-y-1 cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex justify-between items-start gap-2 h-14">
                            <span className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">{layanan.nama}</span>
                            <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                              {layanan.jenis_layanan}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-3xl font-bold text-gray-900 mb-4">
                              Rp {layanan.harga.toLocaleString('id-ID')}
                              <span className="text-sm font-normal text-gray-500">
                                /{layanan.jenis_layanan === 'kiloan' ? 'kg' : 'pcs'}
                              </span>
                            </p>
                            <div className="space-y-3 mb-6">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span>Estimasi {layanan.durasi_pengerjaan_jam} Jam</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Proses Standar Berkualitas</span>
                              </div>
                            </div>
                          </div>
                          <Button className="w-full group-hover:bg-blue-700">
                            Pesan Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 h-12 w-12 rounded-full shadow-lg bg-white/90 hidden md:flex opacity-0 group-hover/scroll:opacity-100 transition-opacity"
                  onClick={() => scroll('right')}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking-form" ref={bookingFormRef} className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Form Pemesanan</h2>
            <p className="text-gray-600">Isi data di bawah ini, kami akan menjemput cucian Anda.</p>
          </div>
          <BookingForm layananList={layananList} preSelectedLayananId={selectedLayananId} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pakaian Kotor Numpuk? Jangan Pusing!</h2>
          <p className="text-xl text-blue-100 mb-8">Hubungi kami sekarang untuk layanan antar jemput. Biar kami yang urus cucian Anda.</p>
          <div className="flex justify-center gap-4">
            <Link href="https://wa.me/6281218582747" target="_blank">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 gap-2">
                <Phone className="h-5 w-5" />
                Chat WhatsApp
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-white">Necis Laundry</span>
              </div>
              <p className="text-sm text-gray-400 mb-6 max-w-sm">
                Solusi laundry terpercaya untuk keluarga dan profesional. Kami hadir untuk memberikan kenyamanan dan kebersihan pakaian Anda.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Layanan</h3>
              <ul className="space-y-2 text-sm">
                <li>Cuci Komplit</li>
                <li>Cuci Kering</li>
                <li>Setrika Saja</li>
                <li>Cuci Bed Cover</li>
                <li>Cuci Sepatu</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Kontak</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 w">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Jl. Langgar No.54 Kec. Jagakarsa, Kota Jakarta Selatan
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  0812-1858-2747
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Senin - Minggu: 07.00 - 20.00
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} Necis Laundry. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
