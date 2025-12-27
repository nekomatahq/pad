"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { SlateEditor } from "./slate-editor";
import { MarginColumn } from "./margin-column";
import { TabBar } from "./tab-bar";
import {
  useTabsStorage,
  type Tab,
  type TabsState,
} from "@/app/hooks/use-tabs-storage";

export const SlateContainer = () => {
  const {
    getTabsState,
    createTab,
    deleteTab,
    setActiveTab,
    updateTabTitle,
    updateTabContent,
    createMarginNote,
    updateMarginNote,
    deleteMarginNote,
  } = useTabsStorage();

  const [tabsState, setTabsState] = useState<TabsState>({
    tabs: [],
    activeTabId: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const createNoteRef = useRef<(() => void) | null>(null);
  const editorKeyRef = useRef(0);

  // Load tabs on mount
  useEffect(() => {
    const state = getTabsState();
    setTabsState(state);
    setIsLoaded(true);
  }, [getTabsState]);

  const activeTab = tabsState.tabs.find((t) => t.id === tabsState.activeTabId);

  const handleCreateNoteRef = useCallback((createFn: () => void) => {
    createNoteRef.current = createFn;
  }, []);

  const handleSelectTab = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      setTabsState((prev) => ({ ...prev, activeTabId: tabId }));
      editorKeyRef.current += 1; // Force re-mount of editor
    },
    [setActiveTab]
  );

  const handleCreateTab = useCallback(() => {
    const newTab = createTab();
    setTabsState((prev) => ({
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id,
    }));
    editorKeyRef.current += 1;
  }, [createTab]);

  const handleDeleteTab = useCallback(
    (tabId: string) => {
      const state = tabsState;
      if (state.tabs.length <= 1) return;

      const tabIndex = state.tabs.findIndex((t) => t.id === tabId);
      const newTabs = state.tabs.filter((t) => t.id !== tabId);

      let newActiveId = state.activeTabId;
      if (state.activeTabId === tabId) {
        const newIndex = Math.min(tabIndex, newTabs.length - 1);
        newActiveId = newTabs[newIndex].id;
        editorKeyRef.current += 1;
      }

      deleteTab(tabId);
      setTabsState({
        tabs: newTabs,
        activeTabId: newActiveId,
      });
    },
    [deleteTab, tabsState]
  );

  const handleRenameTab = useCallback(
    (tabId: string, title: string) => {
      updateTabTitle(tabId, title);
      setTabsState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, title } : tab
        ),
      }));
    },
    [updateTabTitle]
  );

  const handleContentChange = useCallback(
    (content: string) => {
      if (!activeTab) return;
      updateTabContent(activeTab.id, content);
      setTabsState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === activeTab.id ? { ...tab, content } : tab
        ),
      }));
    },
    [activeTab, updateTabContent]
  );

  const handleCreateMarginNote = useCallback(() => {
    if (!activeTab) return { id: "", content: "" };
    const newNote = createMarginNote(activeTab.id);
    setTabsState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === activeTab.id
          ? { ...tab, marginNotes: [...tab.marginNotes, newNote] }
          : tab
      ),
    }));
    return newNote;
  }, [activeTab, createMarginNote]);

  const handleUpdateMarginNote = useCallback(
    (noteId: string, content: string) => {
      if (!activeTab) return;
      updateMarginNote(activeTab.id, noteId, content);
      setTabsState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === activeTab.id
            ? {
                ...tab,
                marginNotes: tab.marginNotes.map((note) =>
                  note.id === noteId ? { ...note, content } : note
                ),
              }
            : tab
        ),
      }));
    },
    [activeTab, updateMarginNote]
  );

  const handleDeleteMarginNote = useCallback(
    (noteId: string) => {
      if (!activeTab) return;
      deleteMarginNote(activeTab.id, noteId);
      setTabsState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === activeTab.id
            ? {
                ...tab,
                marginNotes: tab.marginNotes.filter(
                  (note) => note.id !== noteId
                ),
              }
            : tab
        ),
      }));
    },
    [activeTab, deleteMarginNote]
  );

  // Keyboard shortcuts
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
      // Cmd/Ctrl + Shift + T to create new tab
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "t"
      ) {
        e.preventDefault();
        handleCreateTab();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCreateTab]);

  if (!isLoaded || !activeTab) {
    return (
      <div className="min-h-screen w-full flex justify-center bg-background animate-fade-in" />
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-background animate-fade-in">
      {/* Tab bar */}
      <TabBar
        tabs={tabsState.tabs}
        activeTabId={tabsState.activeTabId}
        onSelectTab={handleSelectTab}
        onCreateTab={handleCreateTab}
        onDeleteTab={handleDeleteTab}
        onRenameTab={handleRenameTab}
      />

      {/* Main content area with margin */}
      <div className="flex w-full max-w-6xl">
        {/* Writing area */}
        <main className="flex-1 flex justify-center md:justify-end">
          <div className="w-full max-w-[760px] px-6 py-16 md:py-24 lg:py-32">
            <SlateEditor
              key={`editor-${activeTab.id}-${editorKeyRef.current}`}
              initialContent={activeTab.content}
              onContentChange={handleContentChange}
            />
          </div>
        </main>

        {/* Margin area - includes hover zone and column */}
        <div className="hidden md:flex py-16 md:py-24 lg:py-32">
          <MarginColumn
            key={`margin-${activeTab.id}-${editorKeyRef.current}`}
            notes={activeTab.marginNotes}
            onCreateNote={handleCreateMarginNote}
            onUpdateNote={handleUpdateMarginNote}
            onDeleteNote={handleDeleteMarginNote}
            onCreateNoteRef={handleCreateNoteRef}
          />
        </div>
      </div>
    </div>
  );
};
