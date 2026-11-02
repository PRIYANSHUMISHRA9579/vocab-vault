export interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: {
    name: string;
    url: string;
  };
}

export interface RawDictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license?: {
    name: string;
    url: string;
  };
  sourceUrls?: string[];
}

export interface BookContext {
  bookTitle?: string;
  sentence?: string;
  pageNumber?: string;
  note?: string;
}

export type MasteryLevel = "new" | "learning" | "reviewing" | "mastered";

export interface SavedWord {
  id: string;
  word: string;
  phonetic: string;
  syllables?: string;
  audioUrl?: string;
  meanings: Meaning[];
  bookContext?: BookContext;
  dateAdded: string; // ISO string
  lastReviewed?: string; // ISO string
  nextReviewDate: string; // ISO string (YYYY-MM-DD)
  reviewCount: number;
  intervalDays: number;
  easeFactor: number; // default 2.5 (SuperMemo SM-2)
  mastery: MasteryLevel;
  tags?: string[];
}

export type ReviewRating = "hard" | "good" | "easy";
