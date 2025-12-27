"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { MarginNote } from "./margin-note";
import type { MarginNote as MarginNoteType } from "@/app/hooks/use-tabs-storage";

const HOVER_TIMEOUT_MS = 15000;

type MarginColumnProps = {
  notes: MarginNoteType[];
  onCreateNote: () => MarginNoteType;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateNoteRef?: (createFn: () => void) => void;
};

export const MarginColumn = ({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onCreateNoteRef,
}: MarginColumnProps) => {
  const [localNotes, setLocalNotes] = useState<MarginNoteType[]>(notes);
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const pendingFocusRef = useRef<string | null>(null);
  const noteRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local notes with props
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const hasNotes = localNotes.length > 0;

  // Handle hover visibility with 15-second auto-hide timer
  useEffect(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    if (isHovered) {
      setShowControls(true);

      if (!hasNotes) {
        hoverTimerRef.current = setTimeout(() => {
          setShowControls(false);
        }, HOVER_TIMEOUT_MS);
      }
    } else {
      if (!hasNotes) {
        setShowControls(false);
      }
    }

    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isHovered, hasNotes]);

  useEffect(() => {
    if (hasNotes) {
      setShowControls(true);
    }
  }, [hasNotes]);

  const handleCreateNote = useCallback(() => {
    const newNote = onCreateNote();
    setLocalNotes((prev) => [...prev, newNote]);
    pendingFocusRef.current = newNote.id;
    setShowControls(true);
  }, [onCreateNote]);

  useEffect(() => {
    if (onCreateNoteRef) {
      onCreateNoteRef(handleCreateNote);
    }
  }, [onCreateNoteRef, handleCreateNote]);

  const handleNoteMount = useCallback((id: string, ref: HTMLDivElement) => {
    noteRefsMap.current.set(id, ref);
    if (pendingFocusRef.current === id) {
      ref.focus();
      pendingFocusRef.current = null;
    }
  }, []);

  const handleUpdateNote = useCallback(
    (noteId: string, content: string) => {
      setLocalNotes((prev) =>
        prev.map((note) =>
          note.id === noteId ? { ...note, content } : note
        )
      );
      onUpdateNote(noteId, content);
    },
    [onUpdateNote]
  );

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      onDeleteNote(noteId);
      setLocalNotes((prev) => {
        const index = prev.findIndex((n) => n.id === noteId);
        const updated = prev.filter((n) => n.id !== noteId);

        if (updated.length > 0) {
          const focusIndex = Math.max(0, index - 1);
          const focusNote = updated[focusIndex];
          const focusRef = noteRefsMap.current.get(focusNote.id);
          if (focusRef) {
            setTimeout(() => focusRef.focus(), 0);
          }
        }

        noteRefsMap.current.delete(noteId);
        return updated;
      });
    },
    [onDeleteNote]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <>
      {/* Large invisible hover trigger zone */}
      <div
        className="hidden md:block w-24 lg:w-32 h-full shrink-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-hidden="true"
      />

      {/* Actual margin column content */}
      <aside
        className="margin-column hidden md:block w-48 lg:w-56 xl:w-64 shrink-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`transition-opacity duration-300 ease-out ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Add button with hint */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleCreateNote}
              className={`w-7 h-7 flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-200 ${
                showControls ? "" : "pointer-events-none"
              }`}
              aria-label="Add margin note"
              tabIndex={showControls ? 0 : -1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </button>
            <span className="text-xs text-muted-foreground/40 italic">
              for side notes
            </span>
          </div>

          {/* Notes list */}
          <div className="space-y-3">
            {localNotes.map((note) => (
              <MarginNote
                key={note.id}
                id={note.id}
                initialContent={note.content}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                onMount={handleNoteMount}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
