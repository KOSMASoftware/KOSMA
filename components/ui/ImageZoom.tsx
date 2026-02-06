import React, { useState, ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { X, ZoomIn } from 'lucide-react';

// Compatible interface with the previous library usage
export interface ImageZoomProps extends ImgHTMLAttributes<HTMLImageElement> {
  zoomMargin?: number; // Ignored in custom impl but kept for compatibility
  overlayBgColor?: string; // Ignored in custom impl but kept for compatibility
}

export const ImageZoom: React.FC<ImageZoomProps> = ({ 
  className, 
  alt, 
  src, 
  zoomMargin, 
  overlayBgColor,
  style, 
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div 
        className={cn("relative group cursor-zoom-in inline-block", className)}
        onClick={() => setIsOpen(true)}
      >
        <img
          src={src}
          alt={alt || 'Image'}
          className={cn("block max-w-full h-auto transition-opacity group-hover:opacity-90", className)}
          style={style}
          {...props}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                <ZoomIn className="w-6 h-6" />
            </div>
        </div>
      </div>

      {isOpen && (
        <div 
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200 cursor-zoom-out backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        >
            <div className="relative w-full h-full flex items-center justify-center">
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()} // Clicking image doesn't close
                />
                <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-0 right-0 p-4 text-white/70 hover:text-white transition-colors"
                >
                    <X className="w-8 h-8" />
                </button>
            </div>
        </div>
      )}
    </>
  );
};