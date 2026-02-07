import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({ className = '', hasError, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`
        flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-900 
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

TextArea.displayName = 'TextArea';