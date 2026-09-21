'use client';

import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'dark' | 'danger' | 'default';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export const Badge: React.FC<BadgeProps> = ({ 
  className = '', 
  variant = 'neutral', 
  size = 'md', 
  children, 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const variants: Record<BadgeVariant, string> = {
    success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    error: 'bg-red-100 text-red-700 border border-red-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
    neutral: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    default: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    dark: 'bg-brand-charcoal-dark text-white border border-neutral-700',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span 
      className={`${baseClasses} ${variants[variant] || variants.neutral} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
