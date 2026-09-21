'use client';

import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon ? (
        <div className="mb-4 text-neutral-400">
          {icon}
        </div>
      ) : (
        <div className="mb-4 rounded-full bg-neutral-100 p-4 text-neutral-400">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="mb-1 text-lg font-heading font-semibold text-brand-charcoal-dark">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-neutral-500">
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};
