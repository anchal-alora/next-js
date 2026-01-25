"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { GTMPageView } from "@/components/GTMPageView";
import { ScrollToTop } from "@/components/ScrollToTop";

export function ClientProviders() {
  return (
    <>
      <ScrollToTop />
      <GTMPageView />
      <Toaster />
      <Sonner />
    </>
  );
}
