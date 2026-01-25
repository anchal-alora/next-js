"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState, Children } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none" | "scale" | "fade-scale" | "blur-fade";
  distance?: number;
  duration?: number;
}

export const ScrollReveal = ({ 
  children, 
  className, 
  delay = 0, 
  direction = "up",
  distance = 40,
  duration = 600
}: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  const getInitialTransform = () => {
    switch (direction) {
      case "up": return `translateY(${distance}px)`;
      case "down": return `translateY(-${distance}px)`;
      case "left": return `translateX(${distance}px)`;
      case "right": return `translateX(-${distance}px)`;
      case "scale": return "scale(0.95)";
      case "fade-scale": return "scale(0.95)";
      case "blur-fade": return "none";
      case "none": return "none";
    }
  };

  const getFinalTransform = () => {
    switch (direction) {
      case "scale":
      case "fade-scale":
        return "scale(1)";
      default:
        return "translate(0)";
    }
  };

  const getFilter = () => {
    if (direction === "blur-fade") {
      return isVisible ? "blur(0px)" : "blur(8px)";
    }
    return "blur(0px)";
  };

  // Respect prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);
  
  const effectiveDuration = prefersReducedMotion ? 0 : duration;

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? getFinalTransform() : getInitialTransform(),
        filter: getFilter(),
        transition: `opacity ${effectiveDuration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${effectiveDuration}ms cubic-bezier(0.16, 1, 0.3, 1), filter ${effectiveDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

interface ScrollRevealStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right" | "none" | "scale" | "fade-scale" | "blur-fade";
  distance?: number;
  duration?: number;
}

export const ScrollRevealStagger = ({
  children,
  className,
  staggerDelay = 100,
  direction = "up",
  distance = 40,
  duration = 600
}: ScrollRevealStaggerProps) => {
  const childrenArray = Children.toArray(children);
  
  return (
    <div className={cn(className)}>
      {childrenArray.map((child, index) => (
        <ScrollReveal
          key={index}
          delay={index * staggerDelay}
          direction={direction}
          distance={distance}
          duration={duration}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
};

export default ScrollReveal;
