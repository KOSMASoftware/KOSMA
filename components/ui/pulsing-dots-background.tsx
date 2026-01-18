
"use client";

import React from "react";
import { cn } from "../../lib/utils";

/**
 * PulsingDotsBackground
 * 
 * Uses the KOSMA SVG dot pattern arranged in corner clusters to keep the content area free.
 * Animations (Pulse + Blur) are applied via CSS to distinct layers matching the SVG structure.
 */

const DotsPattern = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 569 781" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Layer 1: Base Opacity 1.0 */}
    <path className="layer-1" d="M517.841 515.915C531.248 502.509 531.248 480.774 517.841 467.367C504.435 453.961 482.7 453.961 469.294 467.367C455.888 480.774 455.888 502.509 469.294 515.915C482.7 529.321 504.435 529.321 517.841 515.915Z" fill="currentColor"/>
    
    {/* Layer 2: Base Opacity 0.8 */}
    <g className="layer-2">
        <path d="M443.479 590.278C456.885 576.872 456.885 555.136 443.479 541.73C430.073 528.324 408.337 528.324 394.931 541.73C381.525 555.136 381.525 576.872 394.931 590.278C408.337 603.684 430.073 603.684 443.479 590.278Z" fill="currentColor"/>
        <path d="M591.819 441.938C605.225 428.532 605.225 406.796 591.819 393.39C578.413 379.984 556.677 379.984 543.271 393.39C529.865 406.796 529.865 428.532 543.271 441.938C556.677 455.344 578.413 455.344 591.819 441.938Z" fill="currentColor"/>
        <path d="M443.864 441.938C457.27 428.532 457.27 406.796 443.864 393.39C430.458 379.984 408.722 379.984 395.316 393.39C381.91 406.796 381.91 428.532 395.316 441.938C408.722 455.344 430.458 455.344 443.864 441.938Z" fill="currentColor"/>
        <path d="M369.501 516.3C382.907 502.894 382.908 481.159 369.501 467.753C356.095 454.347 334.36 454.347 320.954 467.753C307.548 481.159 307.548 502.894 320.954 516.3C334.36 529.706 356.095 529.706 369.501 516.3Z" fill="currentColor"/>
        <path d="M517.841 367.96C531.248 354.554 531.248 332.819 517.841 319.413C504.435 306.007 482.7 306.007 469.294 319.413C455.888 332.819 455.888 354.554 469.294 367.96C482.7 381.366 504.435 381.366 517.841 367.96Z" fill="currentColor"/>
        <path d="M592.204 590.278C605.61 576.872 605.61 555.136 592.204 541.73C578.798 528.324 557.062 528.324 543.656 541.73C530.25 555.136 530.25 576.872 543.656 590.278C557.062 603.684 578.798 603.684 592.204 590.278Z" fill="currentColor"/>
        <path d="M517.841 664.64C531.248 651.234 531.248 629.499 517.841 616.093C504.435 602.687 482.7 602.687 469.294 616.093C455.888 629.499 455.888 651.234 469.294 664.64C482.7 678.046 504.435 678.046 517.841 664.64Z" fill="currentColor"/>
    </g>

    {/* Layer 3: Base Opacity 0.6 */}
    <g className="layer-3">
        <path d="M369.571 664.64C382.977 651.234 382.977 629.499 369.571 616.093C356.165 602.687 334.429 602.687 321.023 616.093C307.617 629.499 307.617 651.234 321.023 664.64C334.429 678.047 356.165 678.046 369.571 664.64Z" fill="currentColor"/>
        <path d="M295.208 590.278C308.614 576.872 308.614 555.136 295.208 541.73C281.802 528.324 260.066 528.324 246.66 541.73C233.254 555.136 233.254 576.872 246.66 590.278C260.066 603.684 281.802 603.684 295.208 590.278Z" fill="currentColor"/>
        <path d="M589.961 295.524C603.368 282.118 603.368 260.383 589.961 246.977C576.555 233.571 554.82 233.571 541.414 246.977C528.008 260.383 528.008 282.118 541.414 295.524C554.82 308.93 576.555 308.93 589.961 295.524Z" fill="currentColor"/>
        <path d="M221.231 516.3C234.637 502.894 234.637 481.159 221.231 467.753C207.825 454.347 186.089 454.347 172.683 467.753C159.277 481.159 159.277 502.894 172.683 516.3C186.089 529.707 207.825 529.706 221.231 516.3Z" fill="currentColor"/>
        <path d="M369.571 367.96C382.977 354.554 382.977 332.819 369.571 319.413C356.165 306.007 334.429 306.007 321.023 319.413C307.617 332.819 307.617 354.554 321.023 367.96C334.429 381.367 356.165 381.366 369.571 367.96Z" fill="currentColor"/>
        <path d="M295.208 442.323C308.614 428.917 308.614 407.181 295.208 393.775C281.802 380.369 260.067 380.369 246.661 393.775C233.254 407.181 233.254 428.917 246.661 442.323C260.067 455.729 281.802 455.729 295.208 442.323Z" fill="currentColor"/>
        <path d="M515.984 221.547C529.39 208.141 529.39 186.405 515.984 172.999C502.578 159.593 480.843 159.593 467.437 172.999C454.031 186.405 454.031 208.141 467.437 221.547C480.843 234.953 502.578 234.953 515.984 221.547Z" fill="currentColor"/>
        <path d="M443.933 293.598C457.339 280.192 457.339 258.456 443.933 245.05C430.527 231.644 408.792 231.644 395.386 245.05C381.98 258.456 381.98 280.192 395.386 293.598C408.792 307.004 430.527 307.004 443.933 293.598Z" fill="currentColor"/>
        <path d="M443.548 738.618C456.954 725.212 456.954 703.476 443.548 690.07C430.142 676.664 408.406 676.664 395 690.07C381.594 703.476 381.594 725.212 395 738.618C408.406 752.024 430.142 752.024 443.548 738.618Z" fill="currentColor"/>
        <path d="M517.911 812.98C531.317 799.574 531.317 777.839 517.911 764.433C504.505 751.027 482.769 751.027 469.363 764.433C455.957 777.839 455.957 799.574 469.363 812.98C482.769 826.387 504.505 826.387 517.911 812.98Z" fill="currentColor"/>
        <path d="M591.888 739.003C605.294 725.597 605.294 703.862 591.888 690.455C578.482 677.049 556.747 677.049 543.341 690.455C529.934 703.861 529.934 725.597 543.341 739.003C556.747 752.409 578.482 752.409 591.888 739.003Z" fill="currentColor"/>
    </g>

    {/* Layer 4: Base Opacity 0.2 */}
    <g className="layer-4">
        <path d="M295.139 738.618C308.545 725.212 308.545 703.476 295.139 690.07C281.733 676.664 259.997 676.664 246.591 690.07C233.185 703.476 233.185 725.212 246.591 738.618C259.997 752.024 281.733 752.024 295.139 738.618Z" fill="currentColor"/>
        <path d="M221.161 664.64C234.567 651.234 234.567 629.499 221.161 616.093C207.755 602.687 186.02 602.687 172.614 616.093C159.208 629.499 159.208 651.234 172.614 664.64C186.02 678.046 207.755 678.046 221.161 664.64Z" fill="currentColor"/>
        <path d="M146.799 590.278C160.205 576.872 160.205 555.136 146.799 541.73C133.393 528.324 111.657 528.324 98.2512 541.73C84.8451 555.136 84.8451 576.872 98.2512 590.278C111.657 603.684 133.393 603.684 146.799 590.278Z" fill="currentColor"/>
        <path d="M590.278 146.799C603.684 133.393 603.684 111.657 590.278 98.2514C576.872 84.8453 555.136 84.8453 541.73 98.2513C528.324 111.657 528.324 133.393 541.73 146.799C555.136 160.205 576.872 160.205 590.278 146.799Z" fill="currentColor"/>
        <path d="M146.799 442.323C160.205 428.917 160.205 407.181 146.799 393.775C133.393 380.369 111.657 380.369 98.2512 393.775C84.8451 407.181 84.8451 428.917 98.2512 442.323C111.657 455.729 133.393 455.729 146.799 442.323Z" fill="currentColor"/>
        <path d="M72.8214 516.3C86.2275 502.894 86.2275 481.159 72.8215 467.753C59.4154 454.347 37.6799 454.347 24.2738 467.753C10.8678 481.159 10.8678 502.894 24.2738 516.3C37.6799 529.706 59.4154 529.706 72.8214 516.3Z" fill="currentColor"/>
        <path d="M295.524 293.598C308.93 280.192 308.93 258.456 295.524 245.05C282.118 231.644 260.382 231.644 246.976 245.05C233.57 258.456 233.57 280.192 246.976 293.598C260.382 307.004 282.118 307.004 295.524 293.598Z" fill="currentColor"/>
        <path d="M221.161 367.96C234.567 354.554 234.567 332.819 221.161 319.413C207.755 306.007 186.02 306.007 172.614 319.413C159.208 332.819 159.208 354.554 172.614 319.413C186.02 381.366 207.755 381.366 221.161 367.96Z" fill="currentColor"/>
        <path d="M441.938 147.184C455.344 133.778 455.344 112.043 441.938 98.6366C428.531 85.2305 406.796 85.2305 393.39 98.6366C379.984 112.043 379.984 133.778 393.39 147.184C406.796 160.59 428.531 160.59 441.938 147.184Z" fill="currentColor"/>
        <path d="M467.753 72.8216C454.652 59.7214 454.652 37.3741 467.753 24.2739C480.853 11.1737 503.2 11.1738 516.3 24.2739C529.4 37.3741 529.4 59.7214 516.3 72.8215C504.741 87.4629 482.394 87.4629 467.753 72.8216Z" fill="currentColor"/>
        <path d="M369.501 219.62C382.907 206.214 382.907 184.479 369.501 171.073C356.095 157.667 334.36 157.667 320.954 171.073C307.548 184.479 307.548 206.214 320.954 219.62C334.36 233.026 356.095 233.026 369.501 219.62Z" fill="currentColor"/>
        <path d="M369.501 812.98C382.907 799.574 382.908 777.839 369.501 764.433C356.095 751.027 334.36 751.027 320.954 764.433C307.548 777.839 307.548 799.574 320.954 812.98C334.36 826.386 356.095 826.386 369.501 812.98Z" fill="currentColor"/>
    </g>
  </svg>
);

export function PulsingDotsBackground({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  // Legacy props
  background?: string;
  dotCount?: number;
  grayRange?: [number, number];
  radiusRange?: [number, number];
  alphaRange?: [number, number];
}) {
  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-white", containerClassName)}>
      <style>{`
        /* Animation Keyframes: Subtle Pulse + Blur shift */
        @keyframes pulse-layer-1 {
          0% { transform: scale(0.98) translateZ(0); opacity: 1; }
          100% { transform: scale(1.03) translateZ(0); opacity: 0.92; }
        }
        @keyframes pulse-layer-2 {
          0% { transform: scale(0.98) translateZ(0); opacity: 0.8; }
          100% { transform: scale(1.03) translateZ(0); opacity: 0.72; }
        }
        @keyframes pulse-layer-3 {
          0% { transform: scale(0.98) translateZ(0); opacity: 0.6; }
          100% { transform: scale(1.03) translateZ(0); opacity: 0.52; }
        }
        @keyframes pulse-layer-4 {
          0% { transform: scale(0.98) translateZ(0); opacity: 0.2; }
          100% { transform: scale(1.03) translateZ(0); opacity: 0.12; }
        }
        
        /* Base Layer Styles with GPU acceleration */
        .layer-1 {
          animation: pulse-layer-1 8s ease-in-out infinite alternate;
          filter: blur(4px);
          -webkit-filter: blur(4px);
          transform-origin: center;
          transform-box: fill-box;
          will-change: transform, opacity;
        }
        .layer-2 {
          animation: pulse-layer-2 9s ease-in-out infinite alternate-reverse;
          filter: blur(6px);
          -webkit-filter: blur(6px);
          transform-origin: center;
          transform-box: fill-box;
          will-change: transform, opacity;
        }
        .layer-3 {
          animation: pulse-layer-3 10s ease-in-out infinite alternate;
          filter: blur(8px);
          -webkit-filter: blur(8px);
          transform-origin: center;
          transform-box: fill-box;
          will-change: transform, opacity;
        }
        .layer-4 {
          animation: pulse-layer-4 11s ease-in-out infinite alternate-reverse;
          filter: blur(10px);
          -webkit-filter: blur(10px);
          transform-origin: center;
          transform-box: fill-box;
          will-change: transform, opacity;
        }

        /* Mobile Optimizations (Reduced blur radius for clarity) */
        @media (max-width: 768px) {
          .layer-1 { filter: blur(2px); -webkit-filter: blur(2px); }
          .layer-2 { filter: blur(3px); -webkit-filter: blur(3px); }
          .layer-3 { filter: blur(4px); -webkit-filter: blur(4px); opacity: 0.5 !important; }
          .layer-4 { filter: blur(5px); -webkit-filter: blur(5px); opacity: 0.35 !important; }
        }
      `}</style>

      {/* 
         Background Layer Container 
         - Fixed position to stay stable during scroll
         - z-0 or lower to stay behind content
         - pointer-events-none to click through
         - Color: slate-200 (subtle gray)
      */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden text-slate-200 dark:text-slate-700/20">
         
         {/* Cluster 1: Top Left (Rotated for variety) */}
         {/* Mobile: Smaller, pushed further to corner to keep center safe */}
         {/* Desktop: Larger, standard corner position */}
         <div className="absolute 
            -top-[15%] -left-[25%] w-[90%] 
            md:-top-[10%] md:-left-[10%] md:w-[60%] 
            max-w-[700px] transform rotate-180 opacity-90"
         >
            <DotsPattern className="w-full h-full" />
         </div>

         {/* Cluster 2: Bottom Right */}
         {/* Mobile: Pushed down to act as footer texture */}
         <div className="absolute 
            -bottom-[10%] -right-[25%] w-[90%]
            md:-bottom-[10%] md:-right-[10%] md:w-[60%] 
            max-w-[700px] opacity-100"
         >
            <DotsPattern className="w-full h-full" />
         </div>
         
      </div>

      {/* Main Content */}
      <div className={cn("relative z-10 w-full min-h-screen", className)}>
        {children}
      </div>
    </div>
  );
}
