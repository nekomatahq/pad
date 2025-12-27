"use client";

import { useCallback, useRef } from "react";
import { useDebouncedCallback } from "./use-debounced-callback";

const STORAGE_KEY = "nekomata-slate-tabs";
const OLD_SLATE_KEY = "nekomata-slate";
const OLD_MARGINS_KEY = "nekomata-slate-margins";

export type MarginNote = {
  id: string;
  content: string;
};

export type Tab = {
  id: string;
  title: string;
  content: string;
  marginNotes: MarginNote[];
};

export type TabsState = {
  tabs: Tab[];
  activeTabId: string;
};

const generateId = (): string => {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const generateNoteId = (): string => {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const isNoteEmpty = (content: string): boolean => {
  if (!content) return true;
  const stripped = content
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
  return stripped.length === 0;
};

const createDefaultTab = (): Tab => ({
  id: generateId(),
  title: "Untitled",
  content: "",
  marginNotes: [],
});

const migrateOldData = (): Tab | null => {
  if (typeof window === "undefined") return null;

  try {
    const oldContent = localStorage.getItem(OLD_SLATE_KEY);
    const oldMargins = localStorage.getItem(OLD_MARGINS_KEY);

    if (!oldContent && !oldMargins) return null;

    const tab: Tab = {
      id: generateId(),
      title: "Untitled",
      content: oldContent || "",
      marginNotes: oldMargins ? JSON.parse(oldMargins) : [],
    };

    // Clean up old keys after migration
    localStorage.removeItem(OLD_SLATE_KEY);
    localStorage.removeItem(OLD_MARGINS_KEY);

    return tab;
  } catch {
    return null;
  }
};

export const useTabsStorage = () => {
  const stateRef = useRef<TabsState>({ tabs: [], activeTabId: "" });

  const getTabsState = useCallback((): TabsState => {
    if (typeof window === "undefined") {
      return { tabs: [createDefaultTab()], activeTabId: "" };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const state: TabsState = JSON.parse(stored);
        // Filter out empty margin notes
        state.tabs = state.tabs.map((tab) => ({
          ...tab,
          marginNotes: tab.marginNotes.filter(
            (note) => !isNoteEmpty(note.content)
          ),
        }));
        stateRef.current = state;
        return state;
      }

      // Try to migrate old data
      const migratedTab = migrateOldData();
      if (migratedTab) {
        const state: TabsState = {
          tabs: [migratedTab],
          activeTabId: migratedTab.id,
        };
        stateRef.current = state;
        saveStateImmediate(state);
        return state;
      }

      // Create default state with one tab
      const defaultTab = createDefaultTab();
      const defaultState: TabsState = {
        tabs: [defaultTab],
        activeTabId: defaultTab.id,
      };
      stateRef.current = defaultState;
      saveStateImmediate(defaultState);
      return defaultState;
    } catch {
      const defaultTab = createDefaultTab();
      return { tabs: [defaultTab], activeTabId: defaultTab.id };
    }
  }, []);

  const saveStateImmediate = useCallback((state: TabsState): void => {
    if (typeof window === "undefined") return;
    try {
      // Filter out empty margin notes before saving
      const cleanState: TabsState = {
        ...state,
        tabs: state.tabs.map((tab) => ({
          ...tab,
          marginNotes: tab.marginNotes.filter(
            (note) => !isNoteEmpty(note.content)
          ),
        })),
      };
      stateRef.current = state; // Keep full state in memory
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
    } catch {
      // Storage quota exceeded or unavailable
    }
  }, []);

  const saveState = useDebouncedCallback(saveStateImmediate);

  const createTab = useCallback((): Tab => {
    const newTab = createDefaultTab();
    const state = stateRef.current;
    const newState: TabsState = {
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    };
    stateRef.current = newState;
    saveStateImmediate(newState);
    return newTab;
  }, [saveStateImmediate]);

  const deleteTab = useCallback(
    (tabId: string): void => {
      const state = stateRef.current;
      if (state.tabs.length <= 1) return; // Don't delete last tab

      const tabIndex = state.tabs.findIndex((t) => t.id === tabId);
      const newTabs = state.tabs.filter((t) => t.id !== tabId);

      // If deleting active tab, switch to adjacent tab
      let newActiveId = state.activeTabId;
      if (state.activeTabId === tabId) {
        const newIndex = Math.min(tabIndex, newTabs.length - 1);
        newActiveId = newTabs[newIndex].id;
      }

      const newState: TabsState = {
        tabs: newTabs,
        activeTabId: newActiveId,
      };
      stateRef.current = newState;
      saveStateImmediate(newState);
    },
    [saveStateImmediate]
  );

  const setActiveTab = useCallback(
    (tabId: string): void => {
      const state = stateRef.current;
      if (state.activeTabId === tabId) return;

      const newState: TabsState = {
        ...state,
        activeTabId: tabId,
      };
      stateRef.current = newState;
      saveStateImmediate(newState);
    },
    [saveStateImmediate]
  );

  const updateTabTitle = useCallback(
    (tabId: string, title: string): void => {
      const state = stateRef.current;
      const newState: TabsState = {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, title: title || "Untitled" } : tab
        ),
      };
      stateRef.current = newState;
      saveState(newState);
    },
    [saveState]
  );

  const updateTabContent = useCallback(
    (tabId: string, content: string): void => {
      const state = stateRef.current;
      const newState: TabsState = {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, content } : tab
        ),
      };
      stateRef.current = newState;
      saveState(newState);
    },
    [saveState]
  );

  // Margin note operations for a specific tab
  const createMarginNote = useCallback(
    (tabId: string): MarginNote => {
      const newNote: MarginNote = { id: generateNoteId(), content: "" };
      const state = stateRef.current;
      const newState: TabsState = {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === tabId
            ? { ...tab, marginNotes: [...tab.marginNotes, newNote] }
            : tab
        ),
      };
      stateRef.current = newState;
      // Don't save yet - empty note
      return newNote;
    },
    []
  );

  const updateMarginNote = useCallback(
    (tabId: string, noteId: string, content: string): void => {
      const state = stateRef.current;
      const newState: TabsState = {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                marginNotes: tab.marginNotes.map((note) =>
                  note.id === noteId ? { ...note, content } : note
                ),
              }
            : tab
        ),
      };
      stateRef.current = newState;
      if (!isNoteEmpty(content)) {
        saveState(newState);
      }
    },
    [saveState]
  );

  const deleteMarginNote = useCallback(
    (tabId: string, noteId: string): void => {
      const state = stateRef.current;
      const newState: TabsState = {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                marginNotes: tab.marginNotes.filter(
                  (note) => note.id !== noteId
                ),
              }
            : tab
        ),
      };
      stateRef.current = newState;
      saveStateImmediate(newState);
    },
    [saveStateImmediate]
  );

  const getActiveTab = useCallback((): Tab | null => {
    const state = stateRef.current;
    return state.tabs.find((t) => t.id === state.activeTabId) || null;
  }, []);

  return {
    getTabsState,
    createTab,
    deleteTab,
    setActiveTab,
    updateTabTitle,
    updateTabContent,
    createMarginNote,
    updateMarginNote,
    deleteMarginNote,
    getActiveTab,
  };
};

