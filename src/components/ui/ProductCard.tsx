'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AvailabilityBadge, AvailabilityStatus } from './AvailabilityBadge';
import { getImageUrl } from '@/lib/utils/image';
import { StarRating } from './StarRating';
import { PriceDisplay } from './PriceDisplay';
import { Button } from './Button';

// Mock Product Type
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  primaryImage: string;
  price: number;
  mrp: number;
  discountPercentage: number;
  availabilityStatus: AvailabilityStatus;
  rating?: number;
  reviewCount?: number;
  deliveryAvailable: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = encodeURIComponent(`Hi, I'm interested in the ${product.name} (Link: ${window.location.origin}/products/${product.slug})`);
    window.open(`https://wa.me/919629599265?text=${message}`, '_blank');
  };

  const handleEnquireClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // In a real app this might open a modal or navigate to an enquiry page
    window.location.href = `/contact?product=${product.slug}`;
  };

  return (
    <Link href={`/products/${product.slug}`} className={`group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md ${className}`}>
      {/* Image container with fixed aspect ratio */}
      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden group-hover:opacity-90 transition-opacity">
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-2">
          <AvailabilityBadge status={product.availabilityStatus} size="sm" />
          {product.discountPercentage > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-brand-red px-2 py-1 text-xs font-bold text-white shadow-sm">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>
        {getImageUrl(product.primaryImage) ? (
          <Image
            src={getImageUrl(product.primaryImage)}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
          {product.brand}
        </div>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-brand-charcoal-dark md:text-base">
          {product.name}
        </h3>
        
        <div className="mb-3 flex items-center gap-2">
          <StarRating rating={product.rating || 0} size="sm" />
          <span className="text-xs text-neutral-500">
            ({product.reviewCount || 0})
          </span>
        </div>

        <div className="mt-auto pt-2">
          <PriceDisplay mrp={product.mrp} sellingPrice={product.price} discount={product.discountPercentage} />
          
          {product.deliveryAvailable && (
            <div className="mt-2 flex items-center text-xs text-success">
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Delivery Available
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-success text-success hover:bg-success/5"
            onClick={handleWhatsAppClick}
          >
            WhatsApp
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="flex-1"
            onClick={handleEnquireClick}
          >
            Enquire Now
          </Button>
        </div>
      </div>
    </Link>
  );
};

