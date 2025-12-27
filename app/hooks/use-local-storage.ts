"use client";

import { useCallback } from "react";
import { useDebouncedCallback } from "./use-debounced-callback";

const STORAGE_KEY = "nekomata-slate";

export const useLocalStorage = () => {
  const getStoredContent = useCallback((): string => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      return "";
    }
  }, []);

  const saveContentImmediate = useCallback((html: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, html);
    } catch {
      // Storage quota exceeded or unavailable
    }
  }, []);

  const saveContent = useDebouncedCallback(saveContentImmediate);

  return { getStoredContent, saveContent };
};

