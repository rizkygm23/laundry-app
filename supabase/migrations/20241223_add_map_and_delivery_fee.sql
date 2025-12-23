-- Create table for outlet settings (single row intended)
CREATE TABLE IF NOT EXISTS public.outlet_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default dummy location (Monas, Jakarta as placeholder)
INSERT INTO public.outlet_settings (latitude, longitude, address)
SELECT -6.175392, 106.827153, 'Monas, Jakarta Pusat'
WHERE NOT EXISTS (SELECT 1 FROM public.outlet_settings);

-- Add location and delivery fee columns to transaksi table
ALTER TABLE public.transaksi 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS jarak_km DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS ongkos_kirim INTEGER DEFAULT 0;

-- Enable RLS on outlet_settings
ALTER TABLE public.outlet_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to outlet_settings (needed for booking form)
CREATE POLICY "Public can read outlet settings" 
ON public.outlet_settings FOR SELECT 
TO public 
USING (true);

-- Allow authenticated users (admin) to update settings
CREATE POLICY "Admins can update outlet settings" 
ON public.outlet_settings FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Allow authenticated users (admin) to insert settings (if empty)
CREATE POLICY "Admins can insert outlet settings" 
ON public.outlet_settings FOR INSERT 
TO authenticated 
WITH CHECK (true);
