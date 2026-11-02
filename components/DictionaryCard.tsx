"use client";

import React, { useState } from "react";
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Quote,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Check,
} from "lucide-react";
import { RawDictionaryEntry, SavedWord, BookContext } from "@/types/vocab";
import {
  extractBestAudio,
  extractBestPhonetic,
  formatSyllables,
  speakWord,
} from "@/lib/pronunciation";

interface DictionaryCardProps {
  entry: RawDictionaryEntry;
  isSaved: boolean;
  onSave: (wordData: Partial<SavedWord>) => void;
  onSearchWord: (word: string) => void;
}

export const DictionaryCard: React.FC<DictionaryCardProps> = ({
  entry,
  isSaved,
  onSave,
  onSearchWord,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [accent, setAccent] = useState<"en-US" | "en-GB">("en-US");
  const [isBookContextOpen, setIsBookContextOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [sentence, setSentence] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const syllables = formatSyllables(entry.word);
  const phonetic = extractBestPhonetic(entry);
  const audioUrl = extractBestAudio(entry.phonetics);

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);

    try {
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = async () => {
          // If mp3 fails, fallback to Web Speech
          await speakWord(entry.word, accent);
          setIsPlayingAudio(false);
        };
        await audio.play();
      } else {
        await speakWord(entry.word, accent);
        setIsPlayingAudio(false);
      }
    } catch (err) {
      // Fallback
      await speakWord(entry.word, accent);
      setIsPlayingAudio(false);
    }
  };

  const handleSaveWord = () => {
    const bookContext: BookContext | undefined =
      bookTitle.trim() || sentence.trim()
        ? {
            bookTitle: bookTitle.trim() || undefined,
            sentence: sentence.trim() || undefined,
            pageNumber: pageNumber.trim() || undefined,
          }
        : undefined;

    onSave({
      word: entry.word,
      phonetic: phonetic || entry.word,
      syllables,
      audioUrl,
      meanings: entry.meanings,
      bookContext,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <article className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden transition-all duration-300">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700/60 bg-gradient-to-b from-slate-50/70 to-white dark:from-slate-800/80 dark:to-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                {entry.word}
              </h1>
              {syllables && syllables !== entry.word && (
                <span className="text-sm font-mono tracking-wider text-slate-400 dark:text-slate-400">
                  {syllables}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {phonetic && (
                <span className="text-base text-slate-600 dark:text-slate-300 font-mono">
                  {phonetic}
                </span>
              )}

              {/* Accent Selector */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 rounded-lg p-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => setAccent("en-US")}
                  className={`px-2 py-0.5 rounded ${
                    accent === "en-US"
                      ? "bg-white dark:bg-slate-600 text-brand-600 dark:text-brand-300 shadow-xs font-semibold"
                      : "hover:text-slate-900"
                  }`}
                >
                  US 🇺🇸
                </button>
                <button
                  type="button"
                  onClick={() => setAccent("en-GB")}
                  className={`px-2 py-0.5 rounded ${
                    accent === "en-GB"
                      ? "bg-white dark:bg-slate-600 text-brand-600 dark:text-brand-300 shadow-xs font-semibold"
                      : "hover:text-slate-900"
                  }`}
                >
                  UK 🇬🇧
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: Speaker & Save */}
          <div className="flex items-center gap-2.5">
            {/* Audio Button */}
            <button
              type="button"
              onClick={handlePlayAudio}
              disabled={isPlayingAudio}
              title={`Listen to pronunciation (${accent === "en-US" ? "US" : "UK"})`}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isPlayingAudio
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105"
                  : "bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/70 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
              }`}
            >
              <Volume2
                className={`w-6 h-6 ${isPlayingAudio ? "animate-pulse" : ""}`}
              />
            </button>

            {/* Save to Vocabulary Button */}
            <button
              type="button"
              onClick={handleSaveWord}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm transition-all shadow-sm active:scale-95 ${
                isSaved || saveSuccess
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white"
              }`}
            >
              {isSaved || saveSuccess ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Saved in Vault</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save Word</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Book Context Capture Accordion */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setIsBookContextOpen(!isBookContextOpen)}
            className="flex items-center justify-between w-full text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {sentence || bookTitle
                  ? "Book context attached (click to edit)"
                  : "Did you find this in a book? Add sentence & title for better memory"}
              </span>
            </span>
            {isBookContextOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isBookContextOpen && (
            <div className="mt-3 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="e.g. Crime and Punishment"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Page / Chapter
                  </label>
                  <input
                    type="text"
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                    placeholder="e.g. Ch. 4 / p. 112"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  Sentence from the Book
                </label>
                <div className="relative">
                  <Quote className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-500/70" />
                  <textarea
                    rows={2}
                    value={sentence}
                    onChange={(e) => setSentence(e.target.value)}
                    placeholder="Paste the sentence where you saw this word..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveWord}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  Save with Context
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meanings by Part of Speech */}
      <div className="p-6 sm:p-8 space-y-8">
        {entry.meanings.map((meaning, mIndex) => (
          <section key={`${meaning.partOfSpeech}-${mIndex}`} className="space-y-3">
            {/* Part of Speech Pill */}
            <div className="flex items-center gap-2">
              <span className="italic font-serif font-bold text-sm text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-md border border-brand-100 dark:border-brand-900">
                {meaning.partOfSpeech}
              </span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700/60" />
            </div>

            {/* Definitions List */}
            <ol className="space-y-4 pl-1">
              {meaning.definitions.map((def, dIndex) => (
                <li key={dIndex} className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
                  <div className="flex gap-2.5">
                    <span className="font-semibold text-slate-400 dark:text-slate-500 text-xs mt-1">
                      {dIndex + 1}.
                    </span>
                    <div className="space-y-2 flex-1">
                      <p>{def.definition}</p>

                      {def.example && (
                        <p className="text-slate-500 dark:text-slate-400 italic text-sm border-l-2 border-brand-300 dark:border-brand-700 pl-3 py-0.5">
                          &ldquo;{def.example}&rdquo;
                        </p>
                      )}

                      {/* Synonyms for this definition */}
                      {def.synonyms && def.synonyms.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                          <span className="text-slate-400 font-medium">Similar:</span>
                          {def.synonyms.slice(0, 5).map((syn) => (
                            <button
                              key={syn}
                              type="button"
                              onClick={() => onSearchWord(syn)}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300 transition-colors"
                            >
                              {syn}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* General Synonyms for the part of speech */}
            {meaning.synonyms && meaning.synonyms.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
                <span className="text-slate-400 font-medium">Synonyms:</span>
                {meaning.synonyms.slice(0, 6).map((syn) => (
                  <button
                    key={syn}
                    type="button"
                    onClick={() => onSearchWord(syn)}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors border border-emerald-200/50 dark:border-emerald-900/40"
                  >
                    {syn}
                  </button>
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Source citation */}
        {entry.sourceUrls && entry.sourceUrls.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Powered by Free Dictionary API</span>
            <a
              href={entry.sourceUrls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <span>View Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </article>
  );
};
