
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

// Fixed wedge formation (Keil-Form rechts)
const DOTS_SOURCE: Array<Pick<Dot, "x" | "y" | "r" | "gray">> = [
  { x: 0.92, y: 0.86, r: 64, gray: 215 },
  { x: 0.86, y: 0.80, r: 54, gray: 225 },
  { x: 0.95, y: 0.72, r: 44, gray: 230 },

  { x: 0.80, y: 0.70, r: 50, gray: 220 },
  { x: 0.90, y: 0.62, r: 42, gray: 232 },
  { x: 0.84, y: 0.58, r: 38, gray: 228 },

  { x: 0.74, y: 0.66, r: 34, gray: 232 },
  { x: 0.70, y: 0.58, r: 28, gray: 235 },
  { x: 0.66, y: 0.62, r: 24, gray: 236 },
  { x: 0.62, y: 0.56, r: 20, gray: 238 },

  { x: 0.88, y: 0.48, r: 36, gray: 232 },
  { x: 0.94, y: 0.52, r: 28, gray: 238 },
  { x: 0.78, y: 0.88, r: 34, gray: 230 },
];

interface PulsingDotsBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  background?: string;
  dotCount?: number;
  grayRange?: [number, number];
  radiusRange?: [number, number];
  speed?: number;
  alphaRange?: [number, number];
}

export function PulsingDotsBackground({
  children,
  className,
  containerClassName,
  background = "#ffffff",
  dotCount = 13,
  grayRange = [215, 238],
  radiusRange = [20, 64],
  speed = 1,
  alphaRange = [0.22, 0.34],
}: PulsingDotsBackgroundProps) {
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
    
    // Slice dots based on count preference, maintaining the order of the source array
    const baseDots = DOTS_SOURCE.slice(0, Math.min(dotCount, DOTS_SOURCE.length));

    return baseDots.map((d) => ({
      ...d,
      // Map original fixed values to new dynamic ranges if needed, 
      // or just randomize within the requested range for variety.
      // Here we randomize within the range to respect the "Mood" config.
      r: rand(radiusRange[0], radiusRange[1]),
      gray: Math.floor(rand(grayRange[0], grayRange[1])),
      
      phase: rand(0, Math.PI * 2),
      speed: rand(0.6, 1.1) * speed,
      alpha: rand(alphaRange[0], alphaRange[1]),
      blur: rand(8, 16),
      blurAmp: rand(3, 8),
      scaleAmp: rand(0.02, 0.05),
    }));
  }, [dotCount, grayRange, radiusRange, speed, alphaRange]);

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

        // Fade towards left
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
