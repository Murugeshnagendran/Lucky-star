import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return { user: null, error: 'No token provided' };
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, error: error?.message || 'Invalid token' };

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'store_manager') {
    return { user: null, error: 'Unauthorized role' };
  }

  return { user, supabase, error: null };
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, error: authError } = await verifyAuth(req);
    if (authError || !supabase) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const productData = await req.json();
    
    if (!productData.name || !productData.categoryId || !productData.brandId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = {
      category_id: productData.categoryId,
      brand_id: productData.brandId,
      name: productData.name,
      slug: productData.slug,
      model_number: productData.modelNumber,
      sku: productData.sku,
      description: productData.description,
      mrp: productData.mrp,
      selling_price: productData.sellingPrice,
      discount: productData.discount,
      gst_info: productData.gstInfo,
      stock_quantity: productData.stockQuantity,
      minimum_stock_level: productData.minimumStockLevel,
      availability_status: productData.availabilityStatus,
      delivery_available: productData.deliveryAvailable,
      installation_available: productData.installationAvailable,
      store_pickup_available: productData.storePickupAvailable,
      featured: productData.featured,
      status: productData.status,
      primary_image: productData.primaryImage,
      brand_warranty: productData.brandWarranty,
      product_warranty: productData.productWarranty,
      warranty_additional_info: productData.warrantyAdditionalInfo,
      seo_title: productData.seoTitle,
      seo_keywords: productData.seoKeywords,
      seo_description: productData.seoDescription,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    console.error('Supabase save error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { supabase, error: authError } = await verifyAuth(req);
    if (authError || !supabase) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = data.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brandId: p.brand_id,
      categoryId: p.category_id,
      modelNumber: p.model_number,
      sku: p.sku,
      description: p.description,
      mrp: p.mrp,
      sellingPrice: p.selling_price,
      discount: p.discount,
      gstInfo: p.gst_info,
      stockQuantity: p.stock_quantity,
      minimumStockLevel: p.minimum_stock_level,
      availabilityStatus: p.availability_status,
      deliveryAvailable: p.delivery_available,
      installationAvailable: p.installation_available,
      storePickupAvailable: p.store_pickup_available,
      featured: p.featured,
      status: p.status,
      primaryImage: p.primary_image,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Supabase fetch error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { supabase, error: authError } = await verifyAuth(req);
    if (authError || !supabase) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    // Soft delete: mark as discontinued
    const { error } = await supabase
      .from('products')
      .update({ status: 'discontinued', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Product Delete] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
