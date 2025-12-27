"use client";

import { useCallback, useRef } from "react";
import { useDebouncedCallback } from "./use-debounced-callback";

const STORAGE_KEY = "nekomata-slate-margins";

export type MarginNote = {
  id: string;
  content: string;
};

const generateId = (): string => {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const isNoteEmpty = (content: string): boolean => {
  if (!content) return true;
  const stripped = content.replace(/<br\s*\/?>/gi, "").replace(/<[^>]*>/g, "").trim();
  return stripped.length === 0;
};

export const useMarginStorage = () => {
  const notesRef = useRef<MarginNote[]>([]);

  const getStoredNotes = useCallback((): MarginNote[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const notes: MarginNote[] = stored ? JSON.parse(stored) : [];
      // Filter out any empty notes that might have been saved
      const nonEmptyNotes = notes.filter((note) => !isNoteEmpty(note.content));
      notesRef.current = nonEmptyNotes;
      return nonEmptyNotes;
    } catch {
      return [];
    }
  }, []);

  const saveNotesImmediate = useCallback((notes: MarginNote[]): void => {
    if (typeof window === "undefined") return;
    try {
      // Only persist non-empty notes
      const nonEmptyNotes = notes.filter((note) => !isNoteEmpty(note.content));
      notesRef.current = notes; // Keep all in memory for UI
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nonEmptyNotes));
    } catch {
      // Storage quota exceeded or unavailable
    }
  }, []);

  const saveNotes = useDebouncedCallback(saveNotesImmediate);

  const createNote = useCallback((): MarginNote => {
    const newNote: MarginNote = { id: generateId(), content: "" };
    // Add to memory but don't persist empty note yet
    notesRef.current = [...notesRef.current, newNote];
    return newNote;
  }, []);

  const updateNote = useCallback(
    (id: string, content: string): void => {
      const updated = notesRef.current.map((note) =>
        note.id === id ? { ...note, content } : note
      );
      notesRef.current = updated;
      // Only save if content is non-empty
      if (!isNoteEmpty(content)) {
        saveNotes(updated);
      }
    },
    [saveNotes]
  );

  const deleteNote = useCallback(
    (id: string): void => {
      const updated = notesRef.current.filter((note) => note.id !== id);
      notesRef.current = updated;
      saveNotesImmediate(updated);
    },
    [saveNotesImmediate]
  );

  return { getStoredNotes, createNote, updateNote, deleteNote };
};
