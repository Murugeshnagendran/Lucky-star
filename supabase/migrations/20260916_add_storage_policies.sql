-- Ensure the function exists
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'store_manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Create policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('product-images', 'category-images', 'brand-images') );
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK ( public.is_admin() );
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING ( public.is_admin() );
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING ( public.is_admin() );
