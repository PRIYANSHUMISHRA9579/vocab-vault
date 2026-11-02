"use client";

import React, { useState } from "react";
import {
  X,
  Volume2,
  BookOpen,
  Eye,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { SavedWord, ReviewRating } from "@/types/vocab";
import { speakWord } from "@/lib/pronunciation";

interface FlashcardModalProps {
  words: SavedWord[];
  isOpen: boolean;
  onClose: () => void;
  onRate: (wordId: string, rating: ReviewRating) => void;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  words,
  isOpen,
  onClose,
  onRate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  if (!isOpen) return null;

  const currentWord = words[currentIndex];
  const isFinished = !currentWord || currentIndex >= words.length;

  const handlePlayAudio = async () => {
    if (!currentWord || isPlayingAudio) return;
    setIsPlayingAudio(true);

    try {
      if (currentWord.audioUrl) {
        const audio = new Audio(currentWord.audioUrl);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = async () => {
          await speakWord(currentWord.word);
          setIsPlayingAudio(false);
        };
        await audio.play();
      } else {
        await speakWord(currentWord.word);
        setIsPlayingAudio(false);
      }
    } catch {
      await speakWord(currentWord.word);
      setIsPlayingAudio(false);
    }
  };

  const handleRate = (rating: ReviewRating) => {
    if (!currentWord) return;

    if (rating === "easy" || rating === "good") {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });
    }

    onRate(currentWord.id, rating);
    setReviewedCount((prev) => prev + 1);
    setIsRevealed(false);
    setCurrentIndex((prev) => prev + 1);

    if (currentIndex + 1 >= words.length) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Daily Revision Session
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {!isFinished && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {currentIndex + 1} of {words.length}
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!isFinished && (
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5">
            <div
              className="bg-brand-500 h-1.5 transition-all duration-300"
              style={{ width: `${((currentIndex) / words.length) * 100}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {isFinished ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Trophy className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                Revision Complete!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                Great job reviewing {reviewedCount} words today. Spaced repetition works best when done daily!
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Card Face: Word and context */}
              <div className="text-center py-4 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
                    {currentWord.word}
                  </h2>
                  <button
                    onClick={handlePlayAudio}
                    disabled={isPlayingAudio}
                    className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 hover:bg-brand-100"
                    title="Play pronunciation"
                  >
                    <Volume2 className={`w-5 h-5 ${isPlayingAudio ? "animate-pulse" : ""}`} />
                  </button>
                </div>

                {currentWord.phonetic && (
                  <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
                    {currentWord.syllables && <span>{currentWord.syllables} • </span>}
                    {currentWord.phonetic}
                  </p>
                )}
              </div>

              {/* Book quote hint */}
              {currentWord.bookContext?.sentence && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Memory Clue ({currentWord.bookContext.bookTitle || "Your Book"}):</span>
                  </div>
                  <p className="italic text-slate-700 dark:text-slate-300">
                    &ldquo;{currentWord.bookContext.sentence}&rdquo;
                  </p>
                </div>
              )}

              {/* Reveal Section */}
              {!isRevealed ? (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => setIsRevealed(true)}
                    className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Show Meaning</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-slate-700 animate-in fade-in">
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-bold text-brand-600 dark:text-brand-400">
                      {currentWord.meanings?.[0]?.partOfSpeech || "definition"}
                    </span>
                    <p className="text-base text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                      {currentWord.meanings?.[0]?.definitions?.[0]?.definition}
                    </p>
                    {currentWord.meanings?.[0]?.definitions?.[0]?.example && (
                      <p className="text-xs italic text-slate-500 dark:text-slate-400">
                        &ldquo;{currentWord.meanings[0].definitions[0].example}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Rating Buttons */}
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-center text-slate-500 dark:text-slate-400 mb-2">
                      Rate your recall:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleRate("hard")}
                        className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900 transition-colors"
                      >
                        Hard (1d)
                      </button>
                      <button
                        onClick={() => handleRate("good")}
                        className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-900 transition-colors"
                      >
                        Good (3-7d)
                      </button>
                      <button
                        onClick={() => handleRate("easy")}
                        className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-900 transition-colors"
                      >
                        Easy (Mastered)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
