"use client";

import React, { useState, useMemo } from "react";
import {
  Volume2,
  Trash2,
  BookOpen,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { SavedWord, MasteryLevel } from "@/types/vocab";
import { speakWord } from "@/lib/pronunciation";
import { getTodayString } from "@/lib/srs";

interface WordListProps {
  words: SavedWord[];
  onSelectWord: (word: string) => void;
  onDeleteWord: (id: string) => void;
  onStartRevision: () => void;
}

export const WordList: React.FC<WordListProps> = ({
  words,
  onSelectWord,
  onDeleteWord,
  onStartRevision,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMastery, setFilterMastery] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alpha" | "priority">("newest");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const today = getTodayString();

  const handlePlayAudio = async (e: React.MouseEvent, word: SavedWord) => {
    e.stopPropagation();
    if (playingId) return;
    setPlayingId(word.id);

    try {
      if (word.audioUrl) {
        const audio = new Audio(word.audioUrl);
        audio.onended = () => setPlayingId(null);
        audio.onerror = async () => {
          await speakWord(word.word);
          setPlayingId(null);
        };
        await audio.play();
      } else {
        await speakWord(word.word);
        setPlayingId(null);
      }
    } catch {
      await speakWord(word.word);
      setPlayingId(null);
    }
  };

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      // Search match
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        w.word.toLowerCase().includes(query) ||
        (w.bookContext?.bookTitle && w.bookContext.bookTitle.toLowerCase().includes(query)) ||
        (w.bookContext?.sentence && w.bookContext.sentence.toLowerCase().includes(query)) ||
        w.meanings?.some((m) =>
          m.definitions.some((d) => d.definition.toLowerCase().includes(query))
        );

      if (!matchesSearch) return false;

      // Filter match
      if (filterMastery === "all") return true;
      if (filterMastery === "due") {
        return !w.nextReviewDate || w.nextReviewDate <= today;
      }
      return w.mastery === filterMastery;
    });
  }, [words, searchTerm, filterMastery, today]);

  const sortedWords = useMemo(() => {
    return [...filteredWords].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      }
      if (sortBy === "alpha") {
        return a.word.localeCompare(b.word);
      }
      if (sortBy === "priority") {
        // Most overdue first
        const dateA = a.nextReviewDate || "1970-01-01";
        const dateB = b.nextReviewDate || "1970-01-01";
        return dateA.localeCompare(dateB);
      }
      return 0;
    });
  }, [filteredWords, sortBy]);

  const dueCount = words.filter((w) => !w.nextReviewDate || w.nextReviewDate <= today).length;
  const masteredCount = words.filter((w) => w.mastery === "mastered").length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Your Vocabulary Vault
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tracking {words.length} words from your book readings.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-900/60 text-xs">
            <span className="text-amber-800 dark:text-amber-300 font-semibold">{dueCount}</span>
            <span className="text-amber-600 dark:text-amber-400 ml-1">due for review</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-900/60 text-xs">
            <span className="text-emerald-800 dark:text-emerald-300 font-semibold">
              {masteredCount}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 ml-1">mastered</span>
          </div>
        </div>
      </div>

      {/* Controls: Search, Filter, Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search inside vault */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter saved words, books, definitions..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "all", label: `All (${words.length})` },
            { id: "due", label: `Due (${dueCount})` },
            { id: "learning", label: "Learning" },
            { id: "reviewing", label: "Reviewing" },
            { id: "mastered", label: "Mastered" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMastery(tab.id)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors font-medium ${
                filterMastery === tab.id
                  ? "bg-slate-900 dark:bg-brand-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="alpha">Sort: A to Z</option>
          <option value="priority">Sort: Review Priority</option>
        </select>
      </div>

      {/* Words Grid / List */}
      {sortedWords.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-500">
          <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            No words match your filter
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or add more words from your readings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {sortedWords.map((word) => {
            const isDue = !word.nextReviewDate || word.nextReviewDate <= today;
            const firstMeaning = word.meanings?.[0];
            const defText = firstMeaning?.definitions?.[0]?.definition;
            const pos = firstMeaning?.partOfSpeech;

            return (
              <div
                key={word.id}
                onClick={() => onSelectWord(word.word)}
                className="group relative p-5 bg-white dark:bg-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-750 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {word.word}
                      </h3>

                      {word.syllables && word.syllables !== word.word && (
                        <span className="text-xs font-mono text-slate-400">
                          {word.syllables}
                        </span>
                      )}

                      {word.phonetic && (
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {word.phonetic}
                        </span>
                      )}

                      {pos && (
                        <span className="italic font-serif text-[11px] px-2 py-0.2 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 rounded border border-brand-100 dark:border-brand-900">
                          {pos}
                        </span>
                      )}

                      {isDue && (
                        <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Due for Revision</span>
                        </span>
                      )}
                    </div>

                    {/* Definition excerpt */}
                    {defText && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {defText}
                      </p>
                    )}

                    {/* Book context tag */}
                    {word.bookContext?.bookTitle && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300/90 pt-1">
                        <BookOpen className="w-3 h-3 text-amber-600" />
                        <span className="font-medium">
                          From &ldquo;{word.bookContext.bookTitle}&rdquo;
                        </span>
                        {word.bookContext.pageNumber && (
                          <span className="text-slate-400">({word.bookContext.pageNumber})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions: Audio, Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={(e) => handlePlayAudio(e, word)}
                      title="Pronounce word"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <Volume2
                        className={`w-4 h-4 ${
                          playingId === word.id ? "text-brand-500 animate-pulse" : ""
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove "${word.word}" from your vault?`)) {
                          onDeleteWord(word.id);
                        }
                      }}
                      title="Delete word"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
