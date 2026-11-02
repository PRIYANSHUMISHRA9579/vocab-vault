"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clipboard, ArrowRight, Loader2 } from "lucide-react";

interface WordSearchProps {
  onSearch: (word: string) => void;
  isLoading: boolean;
  recentSearches?: string[];
}

const LITERARY_EXAMPLES = [
  "quintessential",
  "mellifluous",
  "solitude",
  "surreptitious",
  "ineffable",
  "sonder",
];

export const WordSearch: React.FC<WordSearchProps> = ({
  onSearch,
  isLoading,
  recentSearches = [],
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Global '/' keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSearch(inputValue.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputValue(text);
        onSearch(text);
      }
    } catch (err) {
      // Fallback if clipboard API permission denied
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setInputValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center shadow-lg hover:shadow-xl focus-within:shadow-2xl transition-all duration-300 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200/90 dark:border-slate-700 focus-within:border-brand-500 dark:focus-within:border-brand-500 overflow-hidden">
          <div className="pl-4 sm:pl-5 text-slate-400 group-focus-within:text-brand-500 transition-colors">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste or type a word from your book..."
            disabled={isLoading}
            className="w-full py-4 pl-3.5 pr-28 text-base sm:text-lg bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {inputValue ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 bg-slate-100 dark:bg-slate-700/60 hover:bg-brand-50 dark:hover:bg-brand-950 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2 sm:px-4 sm:py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center gap-1 shadow-md shadow-brand-500/20 active:scale-95 transition-all"
            >
              <span className="hidden sm:inline">Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="hidden sm:flex justify-end mt-1.5 pr-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">/</kbd> anytime to search
          </span>
        </div>
      </form>

      {/* Quick Literary Suggestions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">
          Try looking up:
        </span>
        {LITERARY_EXAMPLES.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => {
              setInputValue(word);
              onSearch(word);
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
};
