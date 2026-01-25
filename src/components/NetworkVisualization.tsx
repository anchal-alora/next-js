"use client";

import { useEffect, useRef } from 'react';
import { seededRandom, createSeed } from '@/lib/seededRandom';

interface Node {
  x: number;
  y: number;
  z: number; // for 3D depth effect
  vx: number;
  vy: number;
  vz: number;
}

interface NetworkVisualizationProps {
  className?: string;
  nodeCount?: number;
  connectionDistance?: number;
  color?: string;
}

export function NetworkVisualization({ 
  className = '', 
  nodeCount = 80,
  connectionDistance = 120,
  color = '#281C2D'
}: NetworkVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const nodesRef = useRef<Node[]>([]);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert hex to rgb values
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const rgb = hexToRgb(color);

    // Initialize nodes arrays
    const nodes: Node[] = [];
    const backgroundNodes: Node[] = [];

    // Set canvas size with device pixel ratio for high DPI displays
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Reset transform and scale
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      
      return { width, height };
    };

    const initNodes = (width: number, height: number) => {
      nodes.length = 0;
      backgroundNodes.length = 0;

      // Seed based on props and dimensions for determinism
      const seed = createSeed({ nodeCount, connectionDistance, color, width, height, component: 'NetworkVisualization' });
      const rng = seededRandom(seed);

      // Create foreground nodes (denser, darker)
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: rng() * width,
          y: rng() * height,
          z: rng() * 100 + 50, // depth between 50-150
          vx: (rng() - 0.5) * 0.2,
          vy: (rng() - 0.5) * 0.2,
          vz: (rng() - 0.5) * 0.1,
        });
      }

      // Create background nodes (sparser, lighter)
      for (let i = 0; i < nodeCount * 0.6; i++) {
        backgroundNodes.push({
          x: rng() * width,
          y: rng() * height,
          z: rng() * 200 + 150, // further back
          vx: (rng() - 0.5) * 0.1,
          vy: (rng() - 0.5) * 0.1,
          vz: (rng() - 0.5) * 0.05,
        });
      }
    };

    // Get display dimensions (not scaled)
    const getDisplaySize = () => {
      const rect = canvas.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    };

    // Calculate distance from point to line segment
    const distanceToLineSegment = (
      px: number, py: number,
      x1: number, y1: number,
      x2: number, y2: number
    ): number => {
      const A = px - x1;
      const B = py - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;

      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }

      const dx = px - xx;
      const dy = py - yy;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Draw function
    const draw = () => {
      const { width, height } = getDisplaySize();
      ctx.clearRect(0, 0, width, height);
      
      // Test: Draw a subtle rectangle to verify canvas is rendering
      // Uncomment the next 3 lines to test if canvas is visible
      // ctx.fillStyle = 'rgba(40, 28, 45, 0.1)';
      // ctx.fillRect(0, 0, width, height);

      // Update and draw background nodes
      backgroundNodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Wrap around edges
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;
        if (node.z < 150) node.z = 350;
        if (node.z > 350) node.z = 150;
      });

      // Draw background connections - reduced connections
      for (let i = 0; i < backgroundNodes.length; i++) {
        for (let j = i + 1; j < backgroundNodes.length; j++) {
          const dx = backgroundNodes[i].x - backgroundNodes[j].x;
          const dy = backgroundNodes[i].y - backgroundNodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Reduced connection distance for fewer strokes
          if (distance < connectionDistance * 1.2) {
            let baseOpacity = (1 - distance / (connectionDistance * 1.2)) * 0.02;
            let lineWidth = 1;
            
            // Hover effect - check if cursor is near this line
            if (mousePosRef.current) {
              const distToLine = distanceToLineSegment(
                mousePosRef.current.x,
                mousePosRef.current.y,
                backgroundNodes[i].x,
                backgroundNodes[i].y,
                backgroundNodes[j].x,
                backgroundNodes[j].y
              );
              
              // Increase opacity and thickness when cursor is near (within 80px)
              if (distToLine < 80) {
                const hoverIntensity = 1 - (distToLine / 80);
                baseOpacity = Math.min(baseOpacity + hoverIntensity * 0.08, 0.12);
                lineWidth = 1 + hoverIntensity * 1.5;
              }
            }
            
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity})`;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(backgroundNodes[i].x, backgroundNodes[i].y);
            ctx.lineTo(backgroundNodes[j].x, backgroundNodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw background nodes
      backgroundNodes.forEach((node) => {
        const size = 3;
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw foreground nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Wrap around edges
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;
        if (node.z < 50) node.z = 150;
        if (node.z > 150) node.z = 50;
      });

      // Draw foreground connections - reduced connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Reduced connection distance for fewer strokes
          if (distance < connectionDistance * 0.85) {
            // Calculate opacity based on distance and depth
            const depthFactor = (nodes[i].z + nodes[j].z) / 200;
            let baseOpacity = (1 - distance / (connectionDistance * 0.85)) * 0.05 * depthFactor;
            let lineWidth = 1.2;
            
            // Hover effect - check if cursor is near this line
            if (mousePosRef.current) {
              const distToLine = distanceToLineSegment(
                mousePosRef.current.x,
                mousePosRef.current.y,
                nodes[i].x,
                nodes[i].y,
                nodes[j].x,
                nodes[j].y
              );
              
              // Increase opacity and thickness when cursor is near (within 100px)
              if (distToLine < 100) {
                const hoverIntensity = 1 - (distToLine / 100);
                baseOpacity = Math.min(baseOpacity + hoverIntensity * 0.1, 0.18);
                lineWidth = 1.2 + hoverIntensity * 2;
              }
            }
            
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity})`;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw foreground nodes with depth effect
      nodes.forEach((node) => {
        const size = 3 + (150 - node.z) / 35; // Larger when closer
        const opacity = (150 - node.z) / 100 * 0.08;
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Initialize after a small delay to ensure canvas is properly sized
    const initialize = () => {
      const { width, height } = resizeCanvas();
      if (width > 0 && height > 0) {
        initNodes(width, height);
        nodesRef.current = nodes;
        draw();
      } else {
        // Retry if canvas not ready
        requestAnimationFrame(initialize);
      }
    };

    const handleResize = () => {
      const { width, height } = resizeCanvas();
      initNodes(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for hover effects - track from parent section
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

    // Track mouse from the parent section (which contains the canvas)
    const parentSection = canvas.closest('section');
    if (parentSection) {
      parentSection.addEventListener('mousemove', handleMouseMove);
      parentSection.addEventListener('mouseleave', handleMouseLeave);
    } else {
      // Fallback to canvas if no section found
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    // Start initialization
    initialize();

    return () => {
      window.removeEventListener('resize', handleResize);
      const parentSection = canvas.closest('section');
      if (parentSection) {
        parentSection.removeEventListener('mousemove', handleMouseMove);
        parentSection.removeEventListener('mouseleave', handleMouseLeave);
      } else {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodeCount, connectionDistance, color]);

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${className}`}
        style={{ 
          mixBlendMode: 'normal',
          // Temporary test - uncomment to see if canvas element exists
          // backgroundColor: 'rgba(255, 0, 0, 0.2)'
        }}
      />
    </div>
  );
}
