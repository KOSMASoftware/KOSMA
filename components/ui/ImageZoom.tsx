
import React from 'react';
import Zoom from 'react-medium-image-zoom';
import { cn } from '../../lib/utils';

interface ImageZoomProps extends React.ImgHTMLAttributes<HTMLImageElement> {
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
    <Zoom 
        margin={zoomMargin}
        classDialog="custom-zoom-dialog"
    >
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
