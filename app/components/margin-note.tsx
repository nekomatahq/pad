"use client";

import { useRef, useEffect, useCallback, useState } from "react";

type MarginNoteProps = {
  id: string;
  initialContent: string;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onMount?: (id: string, ref: HTMLDivElement) => void;
};

export const MarginNote = ({
  id,
  initialContent,
  onUpdate,
  onDelete,
  onMount,
}: MarginNoteProps) => {
  const noteRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!noteRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (initialContent) {
      noteRef.current.innerHTML = initialContent;
    }

    if (onMount) {
      onMount(id, noteRef.current);
    }
  }, [id, initialContent, onMount]);

  const handleInput = useCallback(() => {
    if (!noteRef.current) return;
    onUpdate(id, noteRef.current.innerHTML);
  }, [id, onUpdate]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Auto-delete empty notes on blur
    if (noteRef.current) {
      const content = noteRef.current.innerHTML.trim();
      const textContent = noteRef.current.textContent?.trim() || "";
      if (!content || !textContent || content === "<br>") {
        onDelete(id);
      }
    }
  }, [id, onDelete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Delete empty note on backspace
      if (e.key === "Backspace") {
        const textContent = noteRef.current?.textContent?.trim() || "";
        if (!textContent) {
          e.preventDefault();
          onDelete(id);
        }
      }
      // Escape to blur
      if (e.key === "Escape") {
        noteRef.current?.blur();
      }
    },
    [id, onDelete]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDelete(id);
    },
    [id, onDelete]
  );

  return (
    <div className="group relative">
      <div
        ref={noteRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        role="textbox"
        aria-label="Margin note"
        tabIndex={0}
        spellCheck="true"
        data-note-id={id}
        className="margin-note w-full min-h-[1.25em] py-1 text-sm leading-relaxed text-muted-foreground outline-none transition-colors duration-200 focus:text-foreground"
      />
      {/* Delete button - visible on focus or hover */}
      <button
        onClick={handleDelete}
        onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
        className={`absolute -left-5 top-1 w-4 h-4 flex items-center justify-center text-muted-foreground/30 hover:text-destructive rounded transition-opacity duration-200 ${
          isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        }`}
        aria-label="Delete note"
        tabIndex={-1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
