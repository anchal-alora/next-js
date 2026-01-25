"use client";

import { useEffect, useRef } from 'react';
import { seededRandom, createSeed } from '@/lib/seededRandom';

interface Shape {
  x: number;
  y: number;
  type: 'circle' | 'square' | 'triangle';
  size: number;
  rotation: number;
  vx: number;
  vy: number;
  morphPhase: number;
}

interface GeometricFlowProps {
  className?: string;
  shapeCount?: number;
  color?: string;
}

export function GeometricFlow({ 
  className = '', 
  shapeCount = 50,
  color = '#281C2D'
}: GeometricFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const shapesRef = useRef<Shape[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const rgb = hexToRgb(color);

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      
      return { width, height };
    };

    const initShapes = (width: number, height: number) => {
      const shapes: Shape[] = [];
      const types: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
      
      // Seed based on props and dimensions
      const seed = createSeed({ shapeCount, color, width, height, component: 'GeometricFlow' });
      const rng = seededRandom(seed);

      for (let i = 0; i < shapeCount; i++) {
        shapes.push({
          x: rng() * width,
          y: rng() * height,
          type: types[Math.floor(rng() * types.length)],
          size: 15 + rng() * 20,
          rotation: rng() * Math.PI * 2,
          vx: (rng() - 0.5) * 0.3,
          vy: (rng() - 0.5) * 0.3,
          morphPhase: rng() * Math.PI * 2,
        });
      }
      
      shapesRef.current = shapes;
    };

    const getDisplaySize = () => {
      const rect = canvas.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    };

    const drawShape = (shape: Shape, opacity: number) => {
      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);
      
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      if (shape.type === 'circle') {
        ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
      } else if (shape.type === 'square') {
        ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
      } else {
        ctx.moveTo(0, -shape.size);
        ctx.lineTo(shape.size * 0.866, shape.size * 0.5);
        ctx.lineTo(-shape.size * 0.866, shape.size * 0.5);
        ctx.closePath();
      }
      
      ctx.stroke();
      ctx.restore();
    };

    let time = 0;
    const draw = () => {
      const { width, height } = getDisplaySize();
      ctx.clearRect(0, 0, width, height);

      time += 0.01;
      const shapes = shapesRef.current;

      shapes.forEach((shape) => {
        // Morphing size
        const morph = Math.sin(time * 2 + shape.morphPhase) * 0.3 + 0.7;
        shape.size = (shape.size / (0.7 + 0.3)) * morph;
        
        // Movement
        shape.x += shape.vx;
        shape.y += shape.vy;
        shape.rotation += 0.01;
        
        // Bounce off edges
        if (shape.x < 0 || shape.x > width) shape.vx *= -1;
        if (shape.y < 0 || shape.y > height) shape.vy *= -1;
        shape.x = Math.max(0, Math.min(width, shape.x));
        shape.y = Math.max(0, Math.min(height, shape.y));
        
        // Attract to mouse
        if (mousePosRef.current) {
          const dx = mousePosRef.current.x - shape.x;
          const dy = mousePosRef.current.y - shape.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < 120) {
            const force = (120 - dist) / 120 * 0.01;
            shape.vx += (dx / dist) * force;
            shape.vy += (dy / dist) * force;
          }
        }
        
        // 80% transparency = 20% opacity (0.2)
        let opacity = 0.2;
        if (mousePosRef.current) {
          const dx = mousePosRef.current.x - shape.x;
          const dy = mousePosRef.current.y - shape.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            opacity = 0.35; // Slightly brighter on hover
          }
        }
        
        drawShape(shape, opacity);
      });

      // Draw connections
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const dx = shapes[i].x - shapes[j].x;
          const dy = shapes[i].y - shapes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            // 80% transparency = 20% opacity
            let opacity = (1 - dist / 100) * 0.2;
            
            if (mousePosRef.current) {
              const midX = (shapes[i].x + shapes[j].x) / 2;
              const midY = (shapes[i].y + shapes[j].y) / 2;
              const dx2 = mousePosRef.current.x - midX;
              const dy2 = mousePosRef.current.y - midY;
              const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
              
              if (dist2 < 60) {
                opacity = Math.min(opacity + 0.12, 0.35);
              }
            }
            
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(shapes[i].x, shapes[i].y);
            ctx.lineTo(shapes[j].x, shapes[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const initialize = () => {
      const { width, height } = resizeCanvas();
      if (width > 0 && height > 0) {
        initShapes(width, height);
        draw();
      } else {
        requestAnimationFrame(initialize);
      }
    };

    const handleResize = () => {
      const { width, height } = resizeCanvas();
      initShapes(width, height);
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mousePosRef.current = null;
    };

    const parentSection = canvas.closest('section');
    if (parentSection) {
      parentSection.addEventListener('mousemove', handleMouseMove);
      parentSection.addEventListener('mouseleave', handleMouseLeave);
    }

    initialize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shapeCount, color]);

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none">
      <canvas ref={canvasRef} className={`w-full h-full ${className}`} />
    </div>
  );
}

