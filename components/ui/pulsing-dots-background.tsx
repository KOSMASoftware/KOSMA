
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
  blur: number;
  blurAmp: number;
  scaleAmp: number;
};

// Fixed layout per specification
const DOTS_FIXED = [
  // rechts außen (dunkler, größer)
  { x: 0.94, y: 0.82, r: 54, gray: 200 },
  { x: 0.95, y: 0.68, r: 44, gray: 205 },
  { x: 0.93, y: 0.54, r: 36, gray: 210 },

  // Mitte
  { x: 0.88, y: 0.74, r: 46, gray: 215 },
  { x: 0.86, y: 0.62, r: 38, gray: 220 },
  { x: 0.86, y: 0.50, r: 32, gray: 225 },

  // nach links auslaufend (heller, kleiner)
  { x: 0.80, y: 0.70, r: 34, gray: 228 },
  { x: 0.78, y: 0.58, r: 28, gray: 232 },
  { x: 0.76, y: 0.48, r: 22, gray: 236 },
  { x: 0.72, y: 0.40, r: 18, gray: 240 },

  // obere Kante
  { x: 0.90, y: 0.40, r: 26, gray: 220 },
  { x: 0.84, y: 0.36, r: 20, gray: 232 },
  { x: 0.78, y: 0.32, r: 16, gray: 240 },
];

export function PulsingDotsBackground({
  children,
  className,
  containerClassName,
  background = "#ffffff",
  dotCount,
  grayRange, // Optional overrides for Auth page
  radiusRange, // Optional overrides for Auth page
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  background?: string;
  dotCount?: number;
  grayRange?: [number, number];
  radiusRange?: [number, number];
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
        // Allow overriding gray/radius for specific variants (like Auth)
        // If ranges are provided, map the fixed value to the new range or randomize
        let finalR = d.r;
        let finalGray = d.gray;

        if (radiusRange) {
           finalR = rand(radiusRange[0], radiusRange[1]);
        }
        if (grayRange) {
           finalGray = Math.floor(rand(grayRange[0], grayRange[1]));
        }

        return {
          ...d,
          r: finalR,
          gray: finalGray,
          phase: rand(0, Math.PI * 2),
          speed: rand(0.6, 1.1),
          alpha: rand(0.22, 0.34),
          blur: rand(8, 16),
          blurAmp: rand(3, 8),
          scaleAmp: rand(0.02, 0.05),
        };
    });
  }, [dotCount, grayRange, radiusRange]);

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
      ctx.filter = "none";
      ctx.globalAlpha = 1;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.restore();

      for (const d of dots) {
        const pulse = (Math.sin(t * d.speed + d.phase) + 1) * 0.5;
        const alpha = d.alpha + pulse * 0.18;
        const blur = d.blur + pulse * d.blurAmp;
        const scale = 1 + (pulse - 0.5) * 2 * d.scaleAmp;

        const x = d.x * window.innerWidth;
        const y = d.y * window.innerHeight;
        const r = d.r * scale;

        // Fade nach links
        const fade = Math.min(1, Math.max(0, (d.x - 0.55) / 0.45));

        ctx.save();
        ctx.filter = `blur(${blur}px)`;
        ctx.globalAlpha = alpha * fade;
        ctx.fillStyle = `rgb(${d.gray},${d.gray},${d.gray})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

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
