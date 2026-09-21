import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'active');

    // Optional category filter
    const categoryId = req.nextUrl.searchParams.get('categoryId');
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Optional brand filter
    const brandId = req.nextUrl.searchParams.get('brandId');
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    // Optional availability filter
    const availability = req.nextUrl.searchParams.get('availability');
    if (availability) {
      query = query.eq('availability_status', availability);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Map to camelCase for the frontend
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
      brandWarranty: p.brand_warranty,
      productWarranty: p.product_warranty,
      warrantyAdditionalInfo: p.warranty_additional_info,
      seoTitle: p.seo_title,
      seoKeywords: p.seo_keywords,
      seoDescription: p.seo_description,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('[Public Products API] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}
