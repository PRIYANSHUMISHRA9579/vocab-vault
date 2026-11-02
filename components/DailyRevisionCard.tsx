"use client";

import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  Volume2,
  BookOpen,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  Trophy,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { SavedWord, ReviewRating } from "@/types/vocab";
import { speakWord } from "@/lib/pronunciation";

interface DailyRevisionCardProps {
  word: SavedWord | null;
  dueCount: number;
  totalWords: number;
  onRate: (wordId: string, rating: ReviewRating) => void;
  onStartFullSession: () => void;
  onSearchWord: (word: string) => void;
}

export const DailyRevisionCard: React.FC<DailyRevisionCardProps> = ({
  word,
  dueCount,
  totalWords,
  onRate,
  onStartFullSession,
  onSearchWord,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [justReviewed, setJustReviewed] = useState(false);

  if (!word) {
    return (
      <div className="w-full max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-brand-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-900 border border-brand-200/60 dark:border-slate-700 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          No words in your vault yet!
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Look up any word you encounter while reading above. Once you save it, VocabVault will automatically present it here every day for quick revision.
        </p>
      </div>
    );
  }

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);

    try {
      if (word.audioUrl) {
        const audio = new Audio(word.audioUrl);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = async () => {
          await speakWord(word.word);
          setIsPlayingAudio(false);
        };
        await audio.play();
      } else {
        await speakWord(word.word);
        setIsPlayingAudio(false);
      }
    } catch {
      await speakWord(word.word);
      setIsPlayingAudio(false);
    }
  };

  const handleRate = (rating: ReviewRating) => {
    if (rating === "easy" || rating === "good") {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    onRate(word.id, rating);
    setJustReviewed(true);
    setTimeout(() => {
      setJustReviewed(false);
      setIsRevealed(false);
    }, 400);
  };

  const firstMeaning = word.meanings?.[0];
  const primaryDefinition = firstMeaning?.definitions?.[0]?.definition;
  const exampleSentence = firstMeaning?.definitions?.[0]?.example;
  const partOfSpeech = firstMeaning?.partOfSpeech;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <Calendar className="w-4 h-4" />
          <span>Daily Word Revision</span>
        </div>

        {dueCount > 1 && (
          <button
            onClick={onStartFullSession}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>{dueCount} words due today</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Flashcard Container */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-brand-500/5 to-indigo-500/10 dark:from-slate-800 dark:to-slate-850 p-1 border-2 border-amber-300/40 dark:border-amber-500/30 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-800/90 rounded-[22px] backdrop-blur-sm space-y-6">
          {/* Top row: Status & Audio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Word of the Day</span>
              </span>

              {word.mastery && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase ${
                    word.mastery === "mastered"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : word.mastery === "reviewing"
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {word.mastery}
                </span>
              )}
            </div>

            <button
              onClick={handlePlayAudio}
              disabled={isPlayingAudio}
              title="Pronounce word"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Volume2 className={`w-5 h-5 ${isPlayingAudio ? "text-brand-500 animate-pulse" : ""}`} />
            </button>
          </div>

          {/* Word Heading */}
          <div className="text-center py-2 space-y-2">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
              {word.word}
            </h2>

            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-sm sm:text-base">
              {word.syllables && <span>{word.syllables}</span>}
              {word.phonetic && <span>• {word.phonetic}</span>}
            </div>
          </div>

          {/* Book Memory Context Clue */}
          {word.bookContext?.sentence && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                <span>Context from &ldquo;{word.bookContext.bookTitle || "Your Reading"}&rdquo;:</span>
              </div>
              <p className="italic text-slate-600 dark:text-slate-300 pl-5 border-l-2 border-brand-400">
                &ldquo;{word.bookContext.sentence}&rdquo;
              </p>
            </div>
          )}

          {/* Revealed / Hidden Meaning Area */}
          {!isRevealed ? (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsRevealed(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <Eye className="w-4 h-4" />
                <span>Reveal Meaning & Pronunciation</span>
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Try to recall the definition before flipping!
              </p>
            </div>
          ) : (
            <div className="space-y-6 pt-2 border-t border-slate-100 dark:border-slate-700/60 animate-in fade-in duration-300">
              {/* Definition */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="italic font-serif font-bold text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                    {partOfSpeech || "definition"}
                  </span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                </div>
                <p className="text-base text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                  {primaryDefinition}
                </p>

                {exampleSentence && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
                    &ldquo;{exampleSentence}&rdquo;
                  </p>
                )}
              </div>

              {/* Self-Rating Prompt */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="text-xs font-semibold text-center text-slate-700 dark:text-slate-300">
                  How well did you remember this word?
                </p>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => handleRate("hard")}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-all active:scale-95"
                  >
                    <span className="text-sm font-bold">Hard</span>
                    <span className="text-[10px] text-rose-600/80 dark:text-rose-400">
                      Review tomorrow
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRate("good")}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 transition-all active:scale-95"
                  >
                    <span className="text-sm font-bold">Good</span>
                    <span className="text-[10px] text-amber-600/80 dark:text-amber-400">
                      In 3–7 days
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRate("easy")}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 transition-all active:scale-95"
                  >
                    <span className="text-sm font-bold">Easy</span>
                    <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400">
                      Mastered!
                    </span>
                  </button>
                </div>
              </div>

              {/* View Full Details Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onSearchWord(word.word)}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  View complete dictionary entry & all definitions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
