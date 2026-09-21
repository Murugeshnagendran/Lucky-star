export type Timestamp = string | Date;

// ─── Status Types ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'store_manager' | 'customer';

export type AvailabilityStatus =
  | 'in_stock'
  | 'limited_stock'
  | 'out_of_stock'
  | 'available_on_order'
  | 'currently_unavailable'
  | 'discontinued';

export type ProductStatus = 'draft' | 'active' | 'hidden' | 'discontinued';

export type EnquiryStatus = 'new' | 'contacted' | 'quoted' | 'closed';

export type FurnitureRequestStatus = 'new' | 'contacted' | 'quoted' | 'in_progress' | 'completed' | 'cancelled';

// ─── Product Types ───────────────────────────────────────────────────────────

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface ProductWarranty {
  brandWarranty?: string;
  productWarranty?: string;
  additionalInfo?: string;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  brandId: string;
  modelNumber: string;
  sku: string;
  images: any[];
  primaryImage: any;
  mrp: number;
  sellingPrice: number;
  discount: number;
  gstInfo?: string;
  specifications: ProductSpecification[];
  warranty: ProductWarranty;
  stockQuantity: number;
  minimumStock: number;
  availabilityStatus: AvailabilityStatus;
  deliveryAvailable: boolean;
  installationAvailable: boolean;
  storePickupAvailable: boolean;
  featured: boolean;
  status: ProductStatus;
  seo?: ProductSEO;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Category & Brand ────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  parentId?: string;
  order: number;
  enabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  enabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  addresses: UserAddress[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Product Enquiry ─────────────────────────────────────────────────────────

export interface ProductEnquiry {
  id: string;
  customerId?: string;
  customerName: string;
  mobile: string;
  email?: string;
  productId: string;
  productName: string;
  productModel?: string;
  quantity: number;
  message?: string;
  preferredContact: 'whatsapp' | 'call' | 'email';
  status: EnquiryStatus;
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Furniture Request ───────────────────────────────────────────────────────

export interface FurnitureRequest {
  id: string;
  customerId?: string;
  customerName: string;
  mobile: string;
  email?: string;
  furnitureType: string;
  dimensions?: string;
  material?: string;
  color?: string;
  design?: string;
  budget?: string;
  requirements: string;
  referenceImages: string[];
  status: FurnitureRequestStatus;
  quotation?: string;
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  previousQty: number;
  newQty: number;
  change: number;
  reason: string;
  adminId: string;
  adminName: string;
  timestamp: Timestamp;
}

// ─── Wishlist ────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: Timestamp;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title?: string;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

// ─── Delivery Zone ───────────────────────────────────────────────────────────

export interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  deliveryCharge: number;
  estimatedDays: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Offer ───────────────────────────────────────────────────────────────────

export interface Offer {
  id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'flat';
  value: number;
  appliesTo: 'product' | 'category' | 'brand' | 'store';
  targetIds: string[];
  startDate: Timestamp;
  endDate: Timestamp;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Banner ──────────────────────────────────────────────────────────────────

export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  order: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Contact Message ─────────────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone: string;
  message: string;
  createdAt: Timestamp;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  in_stock: 'In Stock',
  limited_stock: 'Limited Stock',
  out_of_stock: 'Out of Stock',
  available_on_order: 'Available on Order',
  currently_unavailable: 'Currently Unavailable',
  discontinued: 'Discontinued',
};

export const AVAILABILITY_COLORS: Record<AvailabilityStatus, string> = {
  in_stock: '#16A34A',
  limited_stock: '#EAB308',
  out_of_stock: '#DC2626',
  available_on_order: '#2563EB',
  currently_unavailable: '#737373',
  discontinued: '#1A1A1A',
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  hidden: 'Hidden',
  discontinued: 'Discontinued',
};

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  closed: 'Closed',
};

export const FURNITURE_STATUS_LABELS: Record<FurnitureRequestStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
