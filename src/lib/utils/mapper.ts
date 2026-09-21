export function mapProductToCamelCase(p: any) {
  if (!p) return p;
  return {
    ...p,
    brandId: p.brand_id,
    categoryId: p.category_id,
    modelNumber: p.model_number,
    sellingPrice: p.selling_price,
    gstInfo: p.gst_info,
    stockQuantity: p.stock_quantity,
    minimumStockLevel: p.minimum_stock_level,
    availabilityStatus: p.availability_status,
    deliveryAvailable: p.delivery_available,
    installationAvailable: p.installation_available,
    storePickupAvailable: p.store_pickup_available,
    primaryImage: p.primary_image,
    brandWarranty: p.brand_warranty,
    productWarranty: p.product_warranty,
    warrantyAdditionalInfo: p.warranty_additional_info,
    seoTitle: p.seo_title,
    seoKeywords: p.seo_keywords,
    seoDescription: p.seo_description,
    createdAt: p.created_at,
    updatedAt: p.updated_at
  };
}

export function mapCategoryToCamelCase(c: any) {
  if (!c) return c;
  return {
    ...c,
    parentId: c.parent_id,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  };
}

export function mapBrandToCamelCase(b: any) {
  if (!b) return b;
  return {
    ...b,
    createdAt: b.created_at,
    updatedAt: b.updated_at
  };
}

export function mapEnquiryToCamelCase(e: any) {
  if (!e) return e;
  return {
    ...e,
    customerId: e.customer_id,
    customerName: e.customer_name,
    productId: e.product_id,
    productName: e.product_name,
    productModel: e.product_model,
    preferredContact: e.preferred_contact,
    adminNotes: e.admin_notes,
    createdAt: e.created_at,
    updatedAt: e.updated_at
  };
}

export function mapFurnitureRequestToCamelCase(f: any) {
  if (!f) return f;
  return {
    ...f,
    customerId: f.customer_id,
    customerName: f.customer_name,
    furnitureType: f.furniture_type,
    referenceImages: f.reference_images,
    adminNotes: f.admin_notes,
    createdAt: f.created_at,
    updatedAt: f.updated_at
  };
}
