import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', hasError, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`
        flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-900 
        placeholder:text-gray-400 
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
        disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
        transition-all shadow-sm
        ${hasError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}
        ${className}
      `}
      {...props}
    />
  );
});

Input.displayName = 'Input';