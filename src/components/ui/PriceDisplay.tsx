'use client';

import React from 'react';

interface PriceDisplayProps {
  mrp: number;
  sellingPrice: number;
  discount: number;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  mrp,
  sellingPrice,
  discount,
  className = ''
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className="text-lg font-bold text-brand-red">
        {formatPrice(sellingPrice)}
      </span>
      {discount > 0 && mrp > sellingPrice && (
        <>
          <span className="text-sm text-neutral-500 line-through">
            {formatPrice(mrp)}
          </span>
          <span className="text-xs font-semibold text-success">
            {discount}% OFF
          </span>
        </>
      )}
    </div>
  );
};
