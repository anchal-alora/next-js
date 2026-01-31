import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "savedInsights:v1";

type Listener = () => void;

const listeners = new Set<Listener>();
let storageListenerAttached = false;

const emitChange = () => {
  for (const listener of listeners) listener();
};

const handleStorageEvent = (e: StorageEvent) => {
  if (e.key === STORAGE_KEY) {
    emitChange();
  }
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);

  if (typeof window !== "undefined" && !storageListenerAttached) {
    window.addEventListener("storage", handleStorageEvent);
    storageListenerAttached = true;
  }

  return () => {
    listeners.delete(listener);

    if (typeof window !== "undefined" && storageListenerAttached && listeners.size === 0) {
      window.removeEventListener("storage", handleStorageEvent);
      storageListenerAttached = false;
    }
  };
};

const getSnapshot = () => {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
};

const getServerSnapshot = () => "[]";

/**
 * Hook for managing saved insights/reports using localStorage.
 * Provides reactive state and functions to save/unsave reports by ID.
 */
export function useSavedInsights() {
  const storedJson = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const savedIds = useMemo(() => {
    try {
      const parsed = JSON.parse(storedJson) as unknown;
      if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
        return new Set(parsed);
      }
    } catch (error) {
      console.error("Failed to parse saved insights from localStorage:", error);
    }
    return new Set<string>();
  }, [storedJson]);

  // Write to localStorage
  const writeToStorage = useCallback((ids: Set<string>) => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
      emitChange();
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
