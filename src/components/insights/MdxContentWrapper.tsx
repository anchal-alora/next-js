"use client";

import { useEffect, useRef } from "react";

interface MdxContentWrapperProps {
  children: React.ReactNode;
}

export function MdxContentWrapper({ children }: MdxContentWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find the first h1 element within the container
    const firstH1 = containerRef.current.querySelector("h1");
    if (firstH1) {
      firstH1.remove();
    }
  }, [children]);

  return <div ref={containerRef}>{children}</div>;
}

