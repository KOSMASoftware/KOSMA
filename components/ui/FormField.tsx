import React from 'react';

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, hint, children, className = '' }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider block">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="mt-2 text-xs text-gray-400 font-medium">
          {hint}
        </p>
      )}
    </div>
  );
};