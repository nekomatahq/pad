"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";

type PolicyContainerProps = {
  title: string;
  initialContent: string;
};

export const PolicyContainer = ({
  title,
  initialContent,
}: PolicyContainerProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEditRef = useRef<number>(0);
  const [key, setKey] = useState(0);

  // Initialize editor content
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = initialContent;
  }, [initialContent, key]);

  // Auto-reset after 10 seconds of inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastEditRef.current === 0) return;
      const elapsed = Date.now() - lastEditRef.current;
      if (elapsed >= 10000) {
        lastEditRef.current = 0;
        setKey((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInput = useCallback(() => {
    lastEditRef.current = Date.now();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background animate-fade-in">
      {/* Header with back link */}
      <header className="fixed top-0 left-0 right-0 px-4 py-3 flex items-center text-xs text-muted-foreground/50">
        <Link
          href="/"
          className="hover:text-muted-foreground transition-colors"
          tabIndex={0}
          aria-label="Back to editor"
        >
          back
        </Link>
      </header>

      {/* Main content area with margin */}
      <div className="flex-1 flex justify-center">
        <div className="flex w-full max-w-6xl">
          {/* Writing area */}
          <main className="flex-1 flex justify-center md:justify-end">
            <div className="w-full max-w-[760px] px-6 py-16 md:py-24 lg:py-32">
              <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-8">
                {title}
              </h1>
              <div
                key={key}
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                role="textbox"
                aria-label={`${title} content`}
                aria-multiline="true"
                tabIndex={0}
                spellCheck="true"
                className="slate-editor w-full min-h-[60vh] outline-none text-foreground leading-[1.9] text-lg md:text-xl"
              />
            </div>
          </main>

          {/* Margin placeholder - matches SlateContainer margin column width */}
          <div className="hidden md:flex shrink-0">
            <div className="w-24 lg:w-32" />
            <div className="w-48 lg:w-56 xl:w-64" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 px-4 py-3 flex justify-between items-center text-xs text-muted-foreground/50">
        <div className="flex gap-3">
          <Link
            href="/privacy"
            className="hover:text-muted-foreground transition-colors"
            tabIndex={0}
            aria-label="Privacy policy"
          >
            privacy
          </Link>
          <span>/</span>
          <Link
            href="/terms"
            className="hover:text-muted-foreground transition-colors"
            tabIndex={0}
            aria-label="Terms of service"
          >
            terms
          </Link>
        </div>
        <a
          href="https://github.com/nekomatahq/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
          tabIndex={0}
          aria-label="Nekomata GitHub"
        >
          Nekomata Suite tools / ネコマタ
        </a>
      </footer>
    </div>
  );
};

