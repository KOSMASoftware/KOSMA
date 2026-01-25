import React from 'react';
import Zoom from 'react-medium-image-zoom';
import { cn } from '../../lib/utils';

// Use React.ComponentProps<'img'> to properly inherit all img attributes including src, alt, className, style
export interface ImageZoomProps extends React.ComponentProps<'img'> {
  zoomMargin?: number;
  overlayBgColor?: string;
}

export const ImageZoom = ({ 
  className, 
  alt, 
  src, 
  zoomMargin = 40, 
  overlayBgColor = 'rgba(0,0,0,0.85)',
  style, 
  ...props 
}: ImageZoomProps) => {
  return (
    <Zoom zoomMargin={zoomMargin} overlayBgColorEnd={overlayBgColor}>
      <img
        src={src}
        alt={alt || 'Image'}
        className={cn("block max-w-full h-auto cursor-zoom-in", className)}
        style={style}
        {...props}
      />
    </Zoom>
  );
};