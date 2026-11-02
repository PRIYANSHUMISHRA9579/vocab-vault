"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { WordSearch } from "@/components/WordSearch";
import { DictionaryCard } from "@/components/DictionaryCard";
import { DailyRevisionCard } from "@/components/DailyRevisionCard";
import { WordList } from "@/components/WordList";
import { FlashcardModal } from "@/components/FlashcardModal";
import { BackupModal } from "@/components/BackupModal";
import {
  RawDictionaryEntry,
  SavedWord,
  ReviewRating,
  BookContext,
} from "@/types/vocab";
import { fetchDictionaryEntry } from "@/lib/dictionary";
import {
  getSavedWords,
  saveWord,
  recordWordReview,
  deleteWord,
} from "@/lib/storage";
import { getDueWords, getDailyRevisionWord, getTodayString } from "@/lib/srs";
import { BookOpen, AlertCircle, Sparkles } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [words, setWords] = useState<SavedWord[]>([]);
  const [activeTab, setActiveTab] = useState<"lookup" | "revision" | "library">("lookup");
  const [searchResult, setSearchResult] = useState<RawDictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved words and dark mode preference after mounting
  useEffect(() => {
    setMounted(true);
    const loaded = getSavedWords();
    setWords(loaded);

    const savedTheme = localStorage.getItem("vocab_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleToggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("vocab_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("vocab_theme", "light");
    }
  };

  const handleSearch = async (word: string) => {
    if (!word.trim()) return;
    setIsLoading(true);
    setSearchError(null);

    try {
      // First try our Next.js API route (which has Vercel edge caching)
      const res = await fetch(`/api/dictionary/${encodeURIComponent(word.trim())}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          setSearchResult(json[0]);
          setActiveTab("lookup");
          setIsLoading(false);
          return;
        }
      }

      // Fallback directly to client fetch if route returned error
      const direct = await fetchDictionaryEntry(word);
      if (direct.error || !direct.data || direct.data.length === 0) {
        setSearchError(direct.error || `Could not find definition for "${word}".`);
        setSearchResult(null);
      } else {
        setSearchResult(direct.data[0]);
        setActiveTab("lookup");
      }
    } catch (err: any) {
      setSearchError("Unable to reach dictionary service. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWord = (wordData: Partial<SavedWord>) => {
    if (!wordData.word) return;

    const newWord: SavedWord = {
      id: `word-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      word: wordData.word,
      phonetic: wordData.phonetic || "",
      syllables: wordData.syllables,
      audioUrl: wordData.audioUrl,
      meanings: wordData.meanings || [],
      bookContext: wordData.bookContext,
      dateAdded: new Date().toISOString(),
      nextReviewDate: getTodayString(),
      reviewCount: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      mastery: "learning",
      tags: [],
    };

    const updated = saveWord(newWord);
    setWords(updated);

    // Optionally ping backend API for server storage
    fetch("/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWord),
    }).catch(() => {});
  };

  const handleRateWord = (wordId: string, rating: ReviewRating) => {
    const updated = recordWordReview(wordId, rating);
    setWords(updated);
  };

  const handleDeleteWord = (id: string) => {
    const updated = deleteWord(id);
    setWords(updated);
  };

  // Derived states
  const dueWords = mounted ? getDueWords(words) : [];
  const dailyWord = mounted ? getDailyRevisionWord(words) : null;
  const isCurrentResultSaved =
    searchResult !== null &&
    words.some((w) => w.word.toLowerCase() === searchResult.word.toLowerCase());

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <BookOpen className="w-6 h-6 animate-pulse" />
          <span className="font-serif">Loading VocabVault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        totalWords={words.length}
        dueCount={dueWords.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* Lookup View */}
        {activeTab === "lookup" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero / Reader Welcome */}
            <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                Read without pause.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Paste any unfamiliar word from your book. Listen to its native pronunciation, check Google-style definitions, and never forget it with daily spaced revision.
              </p>
            </div>

            {/* Centered Search Bar */}
            <WordSearch
              onSearch={handleSearch}
              isLoading={isLoading}
            />

            {/* Error Message */}
            {searchError && (
              <div className="w-full max-w-3xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <p className="font-semibold">Search result</p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{searchError}</p>
                </div>
              </div>
            )}

            {/* Active Dictionary Result Card */}
            {searchResult && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <DictionaryCard
                  entry={searchResult}
                  isSaved={isCurrentResultSaved}
                  onSave={handleSaveWord}
                  onSearchWord={handleSearch}
                />
              </div>
            )}

            {/* Daily Revision Highlight Banner (if no active search card is shown) */}
            {!searchResult && dailyWord && (
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
                <DailyRevisionCard
                  word={dailyWord}
                  dueCount={dueWords.length}
                  totalWords={words.length}
                  onRate={handleRateWord}
                  onStartFullSession={() => setIsFlashcardsOpen(true)}
                  onSearchWord={handleSearch}
                />
              </div>
            )}
          </div>
        )}

        {/* Daily Revision View */}
        {activeTab === "revision" && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                Daily Word Revision
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Consistent 2-minute daily revision moves words from short-term memory to lifelong fluency.
              </p>
            </div>

            <DailyRevisionCard
              word={dailyWord}
              dueCount={dueWords.length}
              totalWords={words.length}
              onRate={handleRateWord}
              onStartFullSession={() => setIsFlashcardsOpen(true)}
              onSearchWord={handleSearch}
            />
          </div>
        )}

        {/* Word Bank / History View */}
        {activeTab === "library" && (
          <div className="animate-in fade-in duration-300">
            <WordList
              words={words}
              onSelectWord={(w) => {
                handleSearch(w);
                setActiveTab("lookup");
              }}
              onDeleteWord={handleDeleteWord}
              onStartRevision={() => setIsFlashcardsOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/70 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>
          VocabVault • The Book Reader&apos;s Dictionary & Daily Spaced Revision Tool
        </p>
      </footer>

      {/* Flashcard Session Modal */}
      <FlashcardModal
        words={dueWords.length > 0 ? dueWords : words.slice(0, 5)}
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        onRate={handleRateWord}
      />

      {/* Backup & Export Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onImportComplete={() => setWords(getSavedWords())}
        totalWords={words.length}
      />
    </div>
  );
}
