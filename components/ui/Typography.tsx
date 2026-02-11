
import React from 'react';
import { cn } from '../../lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: any; // Allow polymorphic rendering (e.g. render H2 as h1 tag for SEO if needed)
}

/**
 * H1: Hero Headlines, Main Page Titles
 * Font: Source Sans Pro, Black (900)
 * Mobile: 32/40 | Desktop: 56/72
 */
export const H1: React.FC<TypographyProps> = ({ children, className, as: Component = 'h1' }) => {
  return (
    <Component className={cn("text-h1-m md:text-h1-d font-black tracking-tight text-gray-900", className)}>
      {children}
    </Component>
  );
};

/**
 * H2: Section Headers
 * Font: Source Sans Pro, Black (900)
 * Mobile: 28/36 | Desktop: 40/48
 */
export const H2: React.FC<TypographyProps> = ({ children, className, as: Component = 'h2' }) => {
  return (
    <Component className={cn("text-h2-m md:text-h2-d font-black tracking-tight text-gray-900", className)}>
      {children}
    </Component>
  );
};

/**
 * H3: Card Titles, Sub-Sektionen
 * Font: Source Sans Pro, Bold (700)
 * Mobile: 24/32 | Desktop: 32/40
 */
export const H3: React.FC<TypographyProps> = ({ children, className, as: Component = 'h3' }) => {
  return (
    <Component className={cn("text-h3-m md:text-h3-d font-bold tracking-tight text-gray-900", className)}>
      {children}
    </Component>
  );
};

/**
 * H4: Sub-Headers, Intermediate
 * Font: Source Sans Pro, Bold (700)
 * Mobile: 18/24 | Desktop: 20/28
 */
export const H4: React.FC<TypographyProps> = ({ children, className, as: Component = 'h4' }) => {
  return (
    <Component className={cn("text-h4-m md:text-h4-d font-bold tracking-normal text-gray-900", className)}>
      {children}
    </Component>
  );
};

/**
 * H5: Eyebrows, Labels, Badges
 * Font: Source Sans Pro, Black (900), Uppercase
 * Size: 12/16 (Consistent)
 */
export const H5: React.FC<TypographyProps> = ({ children, className, as: Component = 'h5' }) => {
  return (
    <Component className={cn("text-h5 font-black uppercase tracking-widest text-gray-400", className)}>
      {children}
    </Component>
  );
};

/**
 * Paragraph: Standard Body Text
 * Font: Source Sans Pro, Regular (400)
 * Size: 16/24
 */
export const Paragraph: React.FC<TypographyProps> = ({ children, className, as: Component = 'p' }) => {
  return (
    <Component className={cn("text-body font-normal text-gray-600", className)}>
      {children}
    </Component>
  );
};

/**
 * Label: UI Text (Buttons, Metatags, Controls)
 * Font: Source Sans Pro, Medium (500)
 * Size: 16/24
 */
export const Label: React.FC<TypographyProps> = ({ children, className, as: Component = 'span' }) => {
  return (
    <Component className={cn("text-body font-medium text-gray-700", className)}>
      {children}
    </Component>
  );
};

/**
 * Small: Disclaimer, Footer, Hints
 * Font: Source Sans Pro, Regular (400)
 * Size: 12/16
 */
export const Small: React.FC<TypographyProps> = ({ children, className, as: Component = 'small' }) => {
  return (
    <Component className={cn("text-small font-normal text-gray-500", className)}>
      {children}
    </Component>
  );
};
