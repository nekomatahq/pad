"use client";

import { useRef, useEffect, useCallback, useState } from "react";

type TabItemProps = {
  id: string;
  title: string;
  isActive: boolean;
  canClose: boolean;
  onSelect: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onClose: (id: string) => void;
};

export const TabItem = ({
  id,
  title,
  isActive,
  canClose,
  onSelect,
  onTitleChange,
  onClose,
}: TabItemProps) => {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!titleRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;
    titleRef.current.textContent = title;
  }, [title]);

  const handleClick = useCallback(() => {
    if (!isEditing) {
      onSelect(id);
    }
  }, [id, isEditing, onSelect]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.focus();
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(titleRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (titleRef.current) {
      const newTitle = titleRef.current.textContent?.trim() || "Untitled";
      titleRef.current.textContent = newTitle;
      onTitleChange(id, newTitle);
    }
  }, [id, onTitleChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        titleRef.current?.blur();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (titleRef.current) {
          titleRef.current.textContent = title;
        }
        setIsEditing(false);
        titleRef.current?.blur();
      }
    },
    [title]
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose(id);
    },
    [id, onClose]
  );

  const showCloseButton = canClose && isActive && isHovered;

  return (
    <button
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex items-center gap-1 px-3 py-1.5 text-sm transition-colors duration-150 ${
        isActive
          ? "text-foreground"
          : "text-muted-foreground/60 hover:text-muted-foreground"
      }`}
      aria-label={`Tab: ${title}`}
      aria-selected={isActive}
      role="tab"
    >
      <span
        ref={titleRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`outline-none max-w-[120px] truncate ${
          isEditing ? "cursor-text" : "cursor-pointer"
        }`}
        spellCheck={false}
      />
      {/* Close button */}
      <span
        onClick={handleClose}
        onMouseDown={(e) => e.preventDefault()}
        className={`ml-1 w-4 h-4 flex items-center justify-center text-muted-foreground/40 hover:text-destructive rounded transition-opacity duration-150 ${
          showCloseButton ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Close tab"
        role="button"
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
      </span>
    </button>
  );
};

