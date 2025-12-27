"use client";

import { useRef, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/app/hooks/use-local-storage";

export const SlateEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { getStoredContent, saveContent } = useLocalStorage();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    const storedContent = getStoredContent();
    if (storedContent) {
      editorRef.current.innerHTML = storedContent;
    }

    editorRef.current.focus();
  }, [getStoredContent]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    saveContent(editorRef.current.innerHTML);
  }, [saveContent]);

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      role="textbox"
      aria-label="Writing canvas"
      aria-multiline="true"
      tabIndex={0}
      spellCheck="true"
      className="slate-editor w-full min-h-[60vh] outline-none text-foreground leading-[1.9] text-lg md:text-xl"
    />
  );
};

