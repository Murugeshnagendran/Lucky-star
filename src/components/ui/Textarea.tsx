'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, showCount, maxLength, id, value, defaultValue, onChange, ...props }, ref) => {
    const textareaId = id || React.useId();
    const hasError = !!error;
    const [count, setCount] = React.useState(
      String(value || defaultValue || '').length
    );
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      if (onChange) onChange(e);
    };
    
    const baseClasses = 'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
    const borderClasses = hasError ? 'border-error focus-visible:ring-error' : 'border-neutral-300 focus-visible:border-brand-red focus-visible:ring-brand-red/20';

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-brand-charcoal">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={`${baseClasses} ${borderClasses} ${className}`}
          {...props}
        />
        <div className="flex justify-between items-center text-xs">
          {error ? (
            <p className="text-error">{error}</p>
          ) : <span />}
          {showCount && maxLength && (
            <span className="text-neutral-500">
              {count} / {maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
