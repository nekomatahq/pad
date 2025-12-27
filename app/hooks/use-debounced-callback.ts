"use client";

import { useRef, useCallback } from "react";

const DEBOUNCE_MS = 400;

export const useDebouncedCallback = <T extends (...args: never[]) => void>(
  callback: T
): T => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, DEBOUNCE_MS);
  }, []) as T;

  return debouncedCallback;
};

