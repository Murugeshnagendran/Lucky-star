import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = getSupabaseServerClient();

    const { data: p, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !p) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { data: specs, error: specsError } = await supabase
      .from('product_specifications')
      .select('name, value')
      .eq('product_id', p.id);

    const mapped = {
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
      specifications: specs || [],
      createdAt: p.created_at,
      updatedAt: p.updated_at
    };

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('[Product Details API] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}
