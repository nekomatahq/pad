"use client";

import { useEffect, useRef, useCallback } from "react";
import { SlateEditor } from "./slate-editor";
import { MarginColumn } from "./margin-column";

export const SlateContainer = () => {
  const createNoteRef = useRef<(() => void) | null>(null);

  const handleCreateNoteRef = useCallback((createFn: () => void) => {
    createNoteRef.current = createFn;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + M to create new margin note
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "m"
      ) {
        e.preventDefault();
        createNoteRef.current?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen w-full flex justify-center bg-background animate-fade-in">
      {/* Main content area with margin */}
      <div className="flex w-full max-w-6xl">
        {/* Writing area */}
        <main className="flex-1 flex justify-center md:justify-end">
          <div className="w-full max-w-[760px] px-6 py-16 md:py-24 lg:py-32">
            <SlateEditor />
          </div>
        </main>

        {/* Margin area - includes hover zone and column */}
        <div className="hidden md:flex py-16 md:py-24 lg:py-32">
          <MarginColumn onCreateNoteRef={handleCreateNoteRef} />
        </div>
      </div>
    </div>
  );
};
