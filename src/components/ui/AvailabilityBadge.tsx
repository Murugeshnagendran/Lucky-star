'use client';

import React from 'react';
import { Badge } from './Badge';
// Assuming these are exported from @/lib/types, we define fallbacks here to prevent build errors
// if the types file doesn't exist yet
export type AvailabilityStatus = 
  | 'in_stock' 
  | 'limited_stock' 
  | 'out_of_stock' 
  | 'available_on_order' 
  | 'currently_unavailable' 
  | 'discontinued';

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  in_stock: 'In Stock',
  limited_stock: 'Limited Stock',
  out_of_stock: 'Out of Stock',
  available_on_order: 'Available on Order',
  currently_unavailable: 'Currently Unavailable',
  discontinued: 'Discontinued',
};

export const AVAILABILITY_COLORS: Record<AvailabilityStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'dark'> = {
  in_stock: 'success',
  limited_stock: 'warning',
  out_of_stock: 'error',
  available_on_order: 'info',
  currently_unavailable: 'neutral',
  discontinued: 'dark',
};

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({ 
  status, 
  size = 'md',
  className = '' 
}) => {
  const variant = AVAILABILITY_COLORS[status] || 'neutral';
  const label = AVAILABILITY_LABELS[status] || 'Unknown';

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  );
};
