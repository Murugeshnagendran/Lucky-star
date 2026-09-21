'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'error';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, iconPosition = 'left', variant = 'default', id, ...props }, ref) => {
    const inputId = id || React.useId();
    const isError = variant === 'error' || !!error;
    
    const baseInputClasses = 'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
    const borderClasses = isError ? 'border-error focus-visible:ring-error' : 'border-neutral-300 focus-visible:border-brand-red focus-visible:ring-brand-red/20';
    
    const iconPadding = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-brand-charcoal">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${baseInputClasses} ${borderClasses} ${iconPadding} ${className}`}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
