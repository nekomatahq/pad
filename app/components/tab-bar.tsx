"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { TabItem } from "./tab-item";
import type { Tab } from "@/app/hooks/use-tabs-storage";

const HOVER_TIMEOUT_MS = 15000;

type TabBarProps = {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCreateTab: () => void;
  onDeleteTab: (id: string) => void;
  onRenameTab: (id: string, title: string) => void;
};

export const TabBar = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCreateTab,
  onDeleteTab,
  onRenameTab,
}: TabBarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasTabs = tabs.length > 1;

  // Handle hover visibility with 15-second auto-hide timer
  useEffect(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    if (isHovered) {
      setShowControls(true);

      // Start 15-second timer to auto-hide (only if single tab)
      if (!hasTabs) {
        hoverTimerRef.current = setTimeout(() => {
          setShowControls(false);
        }, HOVER_TIMEOUT_MS);
      }
    } else {
      if (!hasTabs) {
        setShowControls(false);
      }
    }

    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isHovered, hasTabs]);

  // Always show controls when there are multiple tabs
  useEffect(() => {
    if (hasTabs) {
      setShowControls(true);
    }
  }, [hasTabs]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <>
      {/* Invisible hover trigger zone at top */}
      <div
        className="fixed top-0 left-0 right-0 h-16 z-40"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-hidden="true"
      />

      {/* Tab bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-opacity duration-300 ease-out ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="tablist"
        aria-label="Writing tabs"
      >
        <div className="flex items-center gap-1 px-4 py-3">
          {/* Tab items */}
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              id={tab.id}
              title={tab.title}
              isActive={tab.id === activeTabId}
              canClose={tabs.length > 1}
              onSelect={onSelectTab}
              onTitleChange={onRenameTab}
              onClose={onDeleteTab}
            />
          ))}

          {/* Add tab button */}
          <button
            onClick={onCreateTab}
            className="ml-2 w-6 h-6 flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-150"
            aria-label="Add new tab"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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

          {/* Hint text for single tab */}
          {tabs.length === 1 && (
            <span className="ml-2 text-xs text-muted-foreground/40 italic">
              add more sheets
            </span>
          )}
        </div>
      </div>
    </>
  );
};

