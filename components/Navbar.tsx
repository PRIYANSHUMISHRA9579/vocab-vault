"use client";

import React from "react";
import { BookOpen, Sparkles, Moon, Sun, Download, RefreshCw, Layers } from "lucide-react";

interface NavbarProps {
  totalWords: number;
  dueCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBackup: () => void;
  onOpenFlashcards: () => void;
  activeTab: "lookup" | "library" | "revision";
  onTabChange: (tab: "lookup" | "library" | "revision") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalWords,
  dueCount,
  isDarkMode,
  onToggleDarkMode,
  onOpenBackup,
  onOpenFlashcards,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onTabChange("lookup")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              <span>VocabVault</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 rounded border border-brand-200 dark:border-brand-800">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Book Reader&apos;s Dictionary
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => onTabChange("lookup")}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "lookup"
                ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Word Lookup
          </button>
          <button
            onClick={() => onTabChange("revision")}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "revision"
                ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Daily Revision</span>
            {dueCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold bg-amber-500 text-white animate-pulse">
                {dueCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange("library")}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "library"
                ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Word Bank</span>
            <span className="px-1.5 py-0.2 rounded text-[11px] bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
              {totalWords}
            </span>
          </button>
        </nav>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {dueCount > 0 && (
            <button
              onClick={onOpenFlashcards}
              title="Start Flashcards Session"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review ({dueCount})</span>
            </button>
          )}

          <button
            onClick={onOpenBackup}
            title="Export / Backup Words"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-4 py-2 justify-around text-xs font-medium">
        <button
          onClick={() => onTabChange("lookup")}
          className={`py-1 px-3 rounded-md ${
            activeTab === "lookup"
              ? "bg-brand-500 text-white font-semibold"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          Lookup
        </button>
        <button
          onClick={() => onTabChange("revision")}
          className={`py-1 px-3 rounded-md flex items-center gap-1 ${
            activeTab === "revision"
              ? "bg-brand-500 text-white font-semibold"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <span>Revision</span>
          {dueCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
              {dueCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange("library")}
          className={`py-1 px-3 rounded-md flex items-center gap-1 ${
            activeTab === "library"
              ? "bg-brand-500 text-white font-semibold"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <span>Word Bank</span>
          <span>({totalWords})</span>
        </button>
      </div>
    </header>
  );
};
