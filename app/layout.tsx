import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Necis Laundry - Layanan Laundry & Dry Cleaning Profesional Jakarta Selatan',
  description: 'Layanan laundry kiloan dan satuan terpercaya di Jakarta Selatan. Gratis antar jemput, hasil bersih & wangi, harga terjangkau. Cuci kiloan, dry cleaning, setrika, cuci sepatu. Hubungi 0812-1858-2747',
  keywords: ['laundry Jakarta Selatan', 'laundry kiloan', 'dry cleaning', 'cuci sepatu', 'laundry Jagakarsa', 'antar jemput laundry', 'laundry murah', 'Necis Laundry'],
  authors: [{ name: 'Necis Laundry' }],
  creator: 'Necis Laundry',
  publisher: 'Necis Laundry',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://necislaundry.com',
    title: 'Necis Laundry - Layanan Laundry & Dry Cleaning Profesional',
    description: 'Layanan laundry kiloan dan satuan terpercaya di Jakarta Selatan. Gratis antar jemput, hasil bersih & wangi, harga terjangkau.',
    siteName: 'Necis Laundry',
    images: [
      {
        url: '/hero-laundry.jpg',
        width: 1200,
        height: 630,
        alt: 'Necis Laundry - Layanan Professional',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Necis Laundry - Layanan Laundry & Dry Cleaning Profesional',
    description: 'Layanan laundry terpercaya di Jakarta Selatan. Gratis antar jemput!',
    images: ['/hero-laundry.jpg'],
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href="https://necislaundry.com" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
