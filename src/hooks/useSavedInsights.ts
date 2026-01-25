import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "savedInsights:v1";

/**
 * Hook for managing saved insights/reports using localStorage.
 * Provides reactive state and functions to save/unsave reports by ID.
 */
export function useSavedInsights() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Read from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) {
          setSavedIds(new Set(parsed));
        }
      }
    } catch (error) {
      console.error("Failed to parse saved insights from localStorage:", error);
      // Fallback to empty array on parse error
      setSavedIds(new Set());
    }
  }, []);

  // Listen for cross-tab sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          if (e.newValue) {
            const parsed = JSON.parse(e.newValue) as string[];
            if (Array.isArray(parsed)) {
              setSavedIds(new Set(parsed));
            }
          } else {
            setSavedIds(new Set());
          }
        } catch (error) {
          console.error("Failed to parse saved insights from storage event:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Write to localStorage
  const writeToStorage = useCallback((ids: Set<string>) => {
    if (typeof window === "undefined") return;

    try {
      const array = Array.from(ids);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
      setSavedIds(new Set(ids));
    } catch (error) {
      console.error("Failed to write saved insights to localStorage:", error);
    }
  }, []);

  const isSaved = useCallback(
    (id: string): boolean => {
      return savedIds.has(id);
    },
    [savedIds]
  );

  const save = useCallback(
    (id: string) => {
      const newSet = new Set(savedIds);
      newSet.add(id);
      writeToStorage(newSet);
    },
    [savedIds, writeToStorage]
  );

  const unsave = useCallback(
    (id: string) => {
      const newSet = new Set(savedIds);
      newSet.delete(id);
      writeToStorage(newSet);
    },
    [savedIds, writeToStorage]
  );

  const toggleSaved = useCallback(
    (id: string) => {
      if (savedIds.has(id)) {
        unsave(id);
      } else {
        save(id);
      }
    },
    [savedIds, save, unsave]
  );

  const clearSaved = useCallback(() => {
    writeToStorage(new Set());
  }, [writeToStorage]);

  const savedCount = savedIds.size;

  return {
    savedIds,
    isSaved,
    toggleSaved,
    save,
    unsave,
    clearSaved,
    savedCount,
  };
}

