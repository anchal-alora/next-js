"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function forceScrollTop() {
  // Cover both window scrolling and any accidental scroll containers.
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const main = document.querySelector("main");
  if (main && "scrollTo" in main) {
    main.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
}

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const shouldScroll = pathname === "/insights/explore" || pathname.startsWith("/newsroom");
    if (!shouldScroll) return;

    // Some route transitions/Suspense restores can run after the first paint.
    // Run a few times to reliably win.
    forceScrollTop();
    const t0 = window.setTimeout(forceScrollTop, 0);
    const t50 = window.setTimeout(forceScrollTop, 50);
    const raf = window.requestAnimationFrame(forceScrollTop);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t50);
      window.cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
