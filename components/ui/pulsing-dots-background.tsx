
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";

type Dot = {
  x: number;
  y: number;
  r: number;
  gray: number;
  phase: number;
  speed: number;
  alpha: number;
  blurAmp: number;
  scaleAmp: number;
};

// Fixed layout: Structured Wedge/Triangle on the right
// 5 Columns forming a triangle pointing left.
const DOTS_FIXED = [
  // Column 1 (Rightmost) - x=0.96
  { x: 0.96, y: 0.34, r: 38, gray: 200 },
  { x: 0.96, y: 0.48, r: 42, gray: 200 },
  { x: 0.96, y: 0.62, r: 46, gray: 200 }, // Center
  { x: 0.96, y: 0.76, r: 42, gray: 200 },
  { x: 0.96, y: 0.90, r: 38, gray: 200 },

  // Column 2 - x=0.89 (Staggered y)
  { x: 0.89, y: 0.41, r: 34, gray: 210 },
  { x: 0.89, y: 0.55, r: 38, gray: 210 },
  { x: 0.89, y: 0.69, r: 34, gray: 210 },
  { x: 0.89, y: 0.83, r: 30, gray: 210 },

  // Column 3 - x=0.82
  { x: 0.82, y: 0.48, r: 30, gray: 220 },
  { x: 0.82, y: 0.62, r: 34, gray: 220 },
  { x: 0.82, y: 0.76, r: 30, gray: 220 },

  // Column 4 - x=0.75
  { x: 0.75, y: 0.55, r: 24, gray: 230 },
  { x: 0.75, y: 0.69, r: 20, gray: 230 },

  // Column 5 (Tip) - x=0.68
  { x: 0.68, y: 0.62, r: 18, gray: 240 },
];

export function PulsingDotsBackground({
  children,
  className,
  containerClassName,
  background = "#ffffff",
  dotCount,
  grayRange, // Optional overrides for Auth page
  radiusRange, // Optional overrides for Auth page
  alphaRange = [0.18, 0.35],
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  background?: string;
  dotCount?: number;
  grayRange?: [number, number];
  radiusRange?: [number, number];
  alphaRange?: [number, number];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  const dots: Dot[] = useMemo(() => {
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    
    // Use the fixed dots as source, slice if dotCount is provided
    const sourceDots = DOTS_FIXED.slice(0, dotCount ?? DOTS_FIXED.length);

    return sourceDots.map((d) => {
        // PRESERVE STRUCTURE:
        // Do not randomize radius or gray unless specific ranges (overrides) are provided.
        // Even then, try to scale them to maintain hierarchy if possible, 
        // or just clamp them to the new range.
        
        let finalR = d.r;
        let finalGray = d.gray;

        // If a custom range is provided (e.g. Auth page wants smaller dots),
        // we scale the fixed radius to fit the new max.
        // Default max fixed radius is approx 46.
        if (radiusRange) {
           const scale = radiusRange[1] / 46; 
           finalR = d.r * scale;
           // Clamp to ensure min
           if (finalR < radiusRange[0]) finalR = radiusRange[0];
        }

        // If a custom gray range is provided (e.g. Auth page wants lighter dots),
        // we shift the gray value.
        // Default min fixed gray is 200.
        if (grayRange) {
           const shift = grayRange[0] - 200;
           finalGray = d.gray + shift;
           // Clamp to max
           if (finalGray > grayRange[1]) finalGray = grayRange[1];
        }

        return {
          x: d.x,
          y: d.y,
          r: finalR,
          gray: finalGray,
          
          // Phase and speed can vary slightly to create organic movement
          phase: rand(0, Math.PI * 2),
          speed: rand(0.6, 1.0), 
          
          // Base alpha from config
          alpha: rand(alphaRange[0], alphaRange[1]),
          
          // Pulsing amplitudes (subtle)
          blurAmp: rand(2, 4),    
          scaleAmp: rand(0.02, 0.04), 
        };
    });
  }, [dotCount, grayRange, radiusRange, alphaRange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    const render = () => {
      t += 0.016;

      ctx.save();
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      // Draw background
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (const d of dots) {
        // Calculate organic pulse
        const pulse = (Math.sin(t * d.speed + d.phase) + 1) * 0.5;
        
        // Subtle modifications based on pulse
        const currentAlpha = d.alpha + pulse * 0.10; // Minimal alpha pulse
        const currentScale = 1 + (pulse - 0.5) * d.scaleAmp; 

        // Position
        const x = d.x * window.innerWidth;
        const y = d.y * window.innerHeight;
        const r = d.r * currentScale;

        // Depth of Field Effect:
        // Dots closer to the right edge (x=1.0) are sharper.
        // Dots further in (x=0.7) are blurrier.
        // Base blur increases as x decreases.
        const distFromEdge = Math.max(0, 0.98 - d.x); 
        const depthBlur = distFromEdge * 40; // e.g. at 0.70 -> 0.28 * 40 = ~11px blur
        const pulseBlur = pulse * d.blurAmp;
        const totalBlur = Math.max(0, depthBlur + pulseBlur);

        // Fade out to the left
        // Start fading at x=0.6, fully visible at x=0.8+
        const fade = Math.min(1, Math.max(0, (d.x - 0.55) / 0.45));

        ctx.save();
        ctx.filter = `blur(${totalBlur}px)`;
        ctx.globalAlpha = currentAlpha * fade;
        ctx.fillStyle = `rgb(${d.gray},${d.gray},${d.gray})`;
        
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [background, dots]);

  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden", containerClassName)}>
      <canvas
        ref={canvasRef}
        className={cn("fixed inset-0 z-0 pointer-events-none", isSafari ? "blur-[10px]" : "")}
        aria-hidden="true"
      />
      <div className={cn("relative z-10 w-full min-h-screen", className)}>
        {children}
      </div>
    </div>
  );
}
