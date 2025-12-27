"use client";

import { useRef, useEffect, useCallback } from "react";

type SlateEditorProps = {
  initialContent: string;
  onContentChange: (content: string) => void;
};

export const SlateEditor = ({
  initialContent,
  onContentChange,
}: SlateEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    // Reset initialization flag when component remounts (tab switch)
    isInitializedRef.current = false;
  }, []);

  useEffect(() => {
    if (!editorRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (initialContent) {
      editorRef.current.innerHTML = initialContent;
    }

    editorRef.current.focus();
  }, [initialContent]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    onContentChange(editorRef.current.innerHTML);
  }, [onContentChange]);

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
