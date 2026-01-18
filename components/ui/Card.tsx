import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  /**
   * Hex color code for the top border (e.g., "#0093D5").
   * If omitted, you can control the border color via className.
   */
  color?: string;
  className?: string;
  onClick?: () => void;
  /**
   * If true, enables hover lift and shadow effects.
   */
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  color, 
  className, 
  onClick, 
  interactive = false 
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        // Base Layout & Shape
        "bg-white rounded-[2rem] p-8",
        // Borders
        "border border-gray-100 border-t-[8px]",
        // Default Shadow
        "shadow-sm",
        // Flex behavior for content alignment
        "flex flex-col relative overflow-hidden",
        // Interactive States
        interactive && "cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-gray-200",
        className
      )}
      style={color ? { borderTopColor: color } : undefined}
    >
      {children}
    </div>
  );
};
