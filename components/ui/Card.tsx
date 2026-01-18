
import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  /**
   * Hex color code for the top border (e.g., "#0093D5").
   * Also used for the LED effect if enabled.
   */
  color?: string;
  className?: string;
  onClick?: () => void;
  /**
   * If true, enables hover lift and shadow effects.
   */
  interactive?: boolean;
  /**
   * If true, enables the U-shaped LED border impulse on hover.
   * @default false
   */
  enableLedEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  color, 
  className, 
  onClick, 
  interactive = false,
  enableLedEffect = false
}) => {
  const ledColor = color || '#0093D5';

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
        // Interactive States - Add 'group' for hover targeting of children
        interactive && "group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-gray-200",
        className
      )}
      style={color ? { borderTopColor: color } : undefined}
    >
      {enableLedEffect && interactive && (
        <>
          <style>
            {`
              @keyframes led-travel {
                0% { transform: translate(-50%, -50%) rotate(220deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translate(-50%, -50%) rotate(580deg); opacity: 0; }
              }
            `}
          </style>
          {/* LED Container: Absolute, clipped to hide top edge (U-Shape) */}
          <div 
            className="absolute inset-0 pointer-events-none z-0 rounded-[2rem] overflow-hidden"
            style={{ 
               // Clip the top 10px to ensure the LED doesn't conflict with the 8px top border
               clipPath: 'polygon(0% 12px, 100% 12px, 100% 100%, 0% 100%)' 
            }}
          >
             {/* The Border Mask: Creates a 2px transparent border area */}
             <div 
               className="absolute inset-0 rounded-[2rem] p-[2px]"
               style={{
                 mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                 maskComposite: 'exclude',
                 WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                 WebkitMaskComposite: 'xor',
               }}
             >
                {/* The Rotating Light Beam */}
                <div 
                  className="absolute top-1/2 left-1/2 w-[200%] h-[200%] opacity-0 group-hover:animate-[led-travel_1.2s_linear_1_forwards]"
                  style={{
                    background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${ledColor} 30deg, transparent 60deg)`,
                    // Centered via transform in keyframes
                  }}
                />
             </div>
          </div>
        </>
      )}

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
};
