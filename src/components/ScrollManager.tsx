"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function scrollToHashIfPresent() {
  const hash = window.location.hash;
  if (!hash || hash === "#") return false;

  const id = decodeURIComponent(hash.slice(1));
  const el = document.getElementById(id);
  if (!el) return false;

  el.scrollIntoView({ behavior: "auto", block: "start" });
  return true;
}

/**
 * Behavior:
 * - Normal in-app navigation (push/replace): scroll to top.
 * - Back/forward navigation (popstate): preserve/restore scroll position.
 * - Initial load: do not interfere (important for BFCache restores).
 * - Query param changes (filters): ignored by design (we only watch pathname).
 */
export function ScrollManager() {
  const pathname = usePathname();
  const hasMountedRef = useRef(false);
  const didPopStateRef = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      didPopStateRef.current = true;
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    // Back/forward: let the browser restore scroll position.
    if (didPopStateRef.current) {
      didPopStateRef.current = false;
      return;
    }

    // New navigation: go to top (unless there is an anchor target).
    requestAnimationFrame(() => {
      if (scrollToHashIfPresent()) return;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [pathname]);

  return null;
}

