"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { GTMPageView } from "@/components/GTMPageView";
import { ScrollManager } from "@/components/ScrollManager";

export function ClientProviders() {
  return (
    <>
      <GTMPageView />
      <ScrollManager />
      <Toaster />
      <Sonner />
    </>
  );
}
