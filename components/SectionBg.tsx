"use client";

import { useEffect, useRef } from "react";

interface SectionBgProps {
  color?: string;
  variant?: "grid" | "dots" | "lines";
}

export default function SectionBg({ color = "#a1ffc2", variant = "grid" }: SectionBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (variant === "grid") {
        // Animated grid
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        const spacing = 60;
        const offset = (frame * 0.5) % spacing;
        
        for (let x = -spacing + offset; x < canvas.width + spacing; x += spacing) {
          ctx.globalAlpha = 0.03 + Math.sin(frame * 0.02 + x * 0.01) * 0.02;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        
        for (let y = -spacing + offset; y < canvas.height + spacing; y += spacing) {
          ctx.globalAlpha = 0.03 + Math.sin(frame * 0.02 + y * 0.01) * 0.02;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      } else if (variant === "dots") {
        // Animated dots
        const spacing = 40;
        for (let x = 0; x < canvas.width; x += spacing) {
          for (let y = 0; y < canvas.height; y += spacing) {
            const pulse = Math.sin(frame * 0.03 + x * 0.01 + y * 0.01) * 0.5 + 0.5;
            ctx.globalAlpha = 0.05 + pulse * 0.05;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (variant === "lines") {
        // Diagonal animated lines
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        const spacing = 80;
        const offset = (frame * 0.3) % (spacing * 2);
        
        for (let i = -canvas.height; i < canvas.width + canvas.height; i += spacing) {
          ctx.globalAlpha = 0.02 + Math.sin(frame * 0.02 + i * 0.005) * 0.02;
          ctx.beginPath();
          ctx.moveTo(i + offset, 0);
          ctx.lineTo(i + offset - canvas.height, canvas.height);
          ctx.stroke();
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [color, variant]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
