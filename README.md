# Laundry App

An open-source laundry management system built with Next.js (App Router) and Supabase. This project is designed to streamline laundry business operations, from tracking transactions and generating QR code receipts to allowing customers to check their order status in real-time.

## Features

- **Admin Dashboard**: Overview of transactions, services, and customer data.
- **POS & Digital Receipts**: Create new transactions with automatic price calculations. Includes receipt printing and WhatsApp messaging integration.
- **QR Code Tracking**: Every receipt includes a unique QR code that customers can scan to view their order status publicly.
- **Real-time Status**: Customers can monitor status changes (Queued -> Processing -> Completed) live via Supabase Realtime.
- **Maps/Location**: Leaflet integration for setting pickup and delivery coordinates.

## Tech Stack

- **Frontend**: Next.js 13 (App Router), Tailwind CSS, shadcn/ui
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime)
- **Libraries**: React Hook Form, Zod, Leaflet, HTML5-QRCode, Recharts

## Getting Started

Make sure you have Node.js (v16+) installed and a Supabase account.

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/laundry-app.git
   cd laundry-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file and add your Supabase project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
   ```

4. **Database Setup**
   - Open the SQL Editor in your Supabase dashboard.
   - Copy and paste the entire content of `supabase/migrations/setup_complete.sql` and hit *Run*.
   - This script will automatically create the necessary tables (`layanan`, `pelanggan`, `transaksi`) and RLS policies.
   - *(See `SETUP-DATABASE.md` for detailed instructions)*

5. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Directory Structure

- `/app` - Next.js App Router (Pages & API)
- `/components` - UI Components (shadcn), Forms, and Maps
- `/supabase` - Database schema and SQL migrations
- `/lib` - Utilities (Supabase client, date formatters)
- `/contexts` & `/hooks` - Global state and custom hooks

## Additional Documentation

If you encounter issues or need further configuration, refer to the following docs:
- `README-SETUP.md` - Application workflow and general setup
- `SETUP-AUTH.md` - Additional security configurations
- `TROUBLESHOOTING.md` - Common setup errors and solutions

## License

[MIT](LICENSE)
