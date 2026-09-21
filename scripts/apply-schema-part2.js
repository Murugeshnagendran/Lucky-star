const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:Murugesh9080@db.azasqdafiwfldxpirgba.supabase.co:5432/postgres'
});

const sql = `
-- WISHLISTS
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ENQUIRIES
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT,
    product_model TEXT,
    quantity INTEGER DEFAULT 1,
    message TEXT,
    preferred_contact TEXT,
    status TEXT DEFAULT 'new',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Admins can manage enquiries" ON enquiries FOR ALL USING (is_admin());
    CREATE POLICY "Users can insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- FURNITURE REQUESTS
CREATE TABLE IF NOT EXISTS furniture_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    furniture_type TEXT,
    dimensions TEXT,
    material TEXT,
    color TEXT,
    design TEXT,
    budget TEXT,
    requirements TEXT,
    reference_images JSONB,
    status TEXT DEFAULT 'new',
    quotation TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE furniture_requests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Admins can manage furniture requests" ON furniture_requests FOR ALL USING (is_admin());
    CREATE POLICY "Users can insert furniture requests" ON furniture_requests FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- INVENTORY LOGS
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT,
    previous_qty INTEGER,
    new_qty INTEGER,
    change INTEGER,
    reason TEXT,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    admin_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Admins can manage inventory logs" ON inventory_logs FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    customer_name TEXT,
    rating INTEGER,
    title TEXT,
    text TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Everyone can read reviews" ON reviews FOR SELECT USING (status = 'approved');
    CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
    CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- DELIVERY ZONES
CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    areas JSONB,
    delivery_charge DECIMAL,
    estimated_days INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Everyone can read delivery zones" ON delivery_zones FOR SELECT USING (active = true);
    CREATE POLICY "Admins can manage delivery zones" ON delivery_zones FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- OFFERS
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT,
    value DECIMAL,
    applies_to TEXT,
    target_ids JSONB,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Everyone can read offers" ON offers FOR SELECT USING (active = true);
    CREATE POLICY "Admins can manage offers" ON offers FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- STORE SETTINGS
CREATE TABLE IF NOT EXISTS store_settings (
    id TEXT PRIMARY KEY DEFAULT 'store',
    banner_text TEXT,
    free_delivery_threshold DECIMAL,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Everyone can read settings" ON store_settings FOR SELECT USING (true);
    CREATE POLICY "Admins can manage settings" ON store_settings FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase DB successfully!');
    await client.query(sql);
    console.log('Tables created successfully!');
    await client.end();
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
