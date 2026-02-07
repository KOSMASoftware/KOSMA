import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', children, hasError, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`
          flex h-10 w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-900 
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          disabled:cursor-not-allowed disabled:bg-gray-50
          transition-all shadow-sm
          ${hasError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {/* Custom Arrow Indicator */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

Select.displayName = 'Select';