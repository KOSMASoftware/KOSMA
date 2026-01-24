
import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export type NoticeVariant = 'info' | 'success' | 'warning' | 'error';

export interface NoticeProps {
  variant?: NoticeVariant;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

const styles = {
  info: {
    container: 'bg-blue-50 border-blue-100 text-blue-900',
    icon: 'text-blue-500',
    IconComponent: Info
  },
  success: {
    container: 'bg-green-50 border-green-100 text-green-900',
    icon: 'text-green-500',
    IconComponent: CheckCircle
  },
  warning: {
    container: 'bg-amber-50 border-amber-100 text-amber-900',
    icon: 'text-amber-500',
    IconComponent: AlertTriangle
  },
  error: {
    container: 'bg-red-50 border-red-100 text-red-900',
    icon: 'text-red-500',
    IconComponent: AlertCircle
  }
};

export const Notice: React.FC<NoticeProps> = ({ 
  variant = 'info', 
  title, 
  message, 
  onClose,
  className = '' 
}) => {
  const style = styles[variant];
  const Icon = style.IconComponent;

  return (
    <div className={`rounded-2xl border p-4 flex gap-4 items-start relative animate-in fade-in slide-in-from-top-2 duration-300 ${style.container} ${className}`}>
      <div className={`p-1.5 rounded-lg bg-white/60 shrink-0 ${style.icon}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 pt-1">
        <h4 className="font-bold text-sm leading-tight mb-1">{title}</h4>
        {message && <p className="text-xs font-medium opacity-90 leading-relaxed">{message}</p>}
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-inherit opacity-60 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
