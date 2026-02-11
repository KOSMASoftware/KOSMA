
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
  to?: string; // If provided, renders as React Router Link
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  className = '', 
  disabled,
  to,
  ...props 
}) => {
  // Base Layout
  const baseStyles = "inline-flex items-center justify-center h-10 px-5 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider";
  
  // Dashboard-optimized Variants
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-brand-600 shadow-sm border border-transparent",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm",
    ghost: "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
  };

  const content = (
    <>
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : icon ? <span className="mr-2 flex items-center">{icon}</span> : null}
      {children}
    </>
  );

  // Render as Link if 'to' prop is present
  if (to && !disabled) {
    return (
      <Link 
        to={to} 
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {content}
      </Link>
    );
  }

  // Render as standard Button
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
};
