import { SavedWord, ReviewRating, BookContext } from "@/types/vocab";
import { calculateNextReview, getTodayString } from "./srs";

const STORAGE_KEY = "vocab_vault_words_v1";

const SAMPLE_WORDS: SavedWord[] = [
  {
    id: "sample-1",
    word: "ephemeral",
    phonetic: "/ɪˈfem.ər.əl/",
    syllables: "e·phem·er·al",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/ephemeral-us.mp3",
    meanings: [
      {
        partOfSpeech: "adjective",
        definitions: [
          {
            definition: "Lasting for a very short time; transitory; fleeting.",
            example: "Fashions are ephemeral, but true style remains timeless.",
            synonyms: ["transitory", "fleeting", "evanescent", "short-lived"],
            antonyms: ["eternal", "permanent", "perpetual"],
          },
        ],
        synonyms: ["transient", "fleeting"],
        antonyms: ["permanent"],
      },
    ],
    bookContext: {
      bookTitle: "The Picture of Dorian Gray",
      sentence: "Youth is the one thing worth having. When I find that I am growing old, I shall kill myself. Youth is ephemeral.",
      pageNumber: "28",
      note: "Lord Henry talking to Dorian about the fragility of beauty.",
    },
    dateAdded: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastReviewed: new Date(Date.now() - 86400000).toISOString(),
    nextReviewDate: getTodayString(),
    reviewCount: 2,
    intervalDays: 1,
    easeFactor: 2.5,
    mastery: "learning",
    tags: ["classic", "literature"],
  },
  {
    id: "sample-2",
    word: "petrichor",
    phonetic: "/ˈpet.rɪ.kɔːr/",
    syllables: "pet·ri·chor",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/petrichor-us.mp3",
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: "A pleasant, distinctive smell that frequently accompanies the first rain after a long period of warm, dry weather.",
            example: "The petrichor rose from the dry pavement as the afternoon thunderstorm arrived.",
            synonyms: ["earthy scent"],
            antonyms: [],
          },
        ],
        synonyms: [],
        antonyms: [],
      },
    ],
    bookContext: {
      bookTitle: "Where the Crawdads Sing",
      sentence: "The rich petrichor of the marshland swelled in the warm summer air.",
      note: "Delia Owens nature imagery.",
    },
    dateAdded: new Date(Date.now() - 5 * 86400000).toISOString(),
    lastReviewed: new Date(Date.now() - 2 * 86400000).toISOString(),
    nextReviewDate: getTodayString(),
    reviewCount: 1,
    intervalDays: 1,
    easeFactor: 2.5,
    mastery: "new",
    tags: ["nature"],
  },
  {
    id: "sample-3",
    word: "serendipity",
    phonetic: "/ˌser.ənˈdɪp.ə.t̬i/",
    syllables: "ser·en·dip·i·ty",
    audioUrl: "https://api.dictionaryapi.dev/media/pronunciations/en/serendipity-us.mp3",
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: "The occurrence and development of events by chance in a happy or beneficial way.",
            example: "A fortunate stroke of serendipity led the scientist to the accidental breakthrough.",
            synonyms: ["chance", "happy accident", "fluke", "fortune"],
            antonyms: ["misfortune"],
          },
        ],
        synonyms: ["luck"],
        antonyms: [],
      },
    ],
    bookContext: {
      bookTitle: "The Alchemist",
      sentence: "When you want something, all the universe conspires in helping you to achieve it.",
      note: "Theme of finding omens and serendipity.",
    },
    dateAdded: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastReviewed: new Date(Date.now() - 1 * 86400000).toISOString(),
    nextReviewDate: getTodayString(),
    reviewCount: 3,
    intervalDays: 7,
    easeFactor: 2.6,
    mastery: "reviewing",
    tags: ["philosophy"],
  },
];

/**
 * Loads all saved words from localStorage.
 */
export function getSavedWords(): SavedWord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial sample words
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_WORDS));
      return SAMPLE_WORDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load saved words from localStorage:", err);
    return [];
  }
}

/**
 * Saves or updates a word in localStorage.
 */
export function persistWords(words: SavedWord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch (err) {
    console.error("Failed to persist words:", err);
  }
}

/**
 * Adds a new word or updates an existing one if already present.
 */
export function saveWord(word: SavedWord): SavedWord[] {
  const words = getSavedWords();
  const existingIndex = words.findIndex(
    (w) => w.word.toLowerCase() === word.word.toLowerCase()
  );

  let updated: SavedWord[];
  if (existingIndex >= 0) {
    // Preserve existing SRS progress while updating meanings or context
    const existing = words[existingIndex];
    const merged: SavedWord = {
      ...existing,
      ...word,
      id: existing.id,
      dateAdded: existing.dateAdded,
      reviewCount: existing.reviewCount,
      intervalDays: existing.intervalDays,
      easeFactor: existing.easeFactor,
      mastery: existing.mastery,
      nextReviewDate: existing.nextReviewDate,
      bookContext: {
        ...existing.bookContext,
        ...word.bookContext,
      },
    };
    updated = [...words];
    updated[existingIndex] = merged;
  } else {
    updated = [word, ...words];
  }

  persistWords(updated);
  return updated;
}

/**
 * Updates a word's spaced repetition status after revision.
 */
export function recordWordReview(id: string, rating: ReviewRating): SavedWord[] {
  const words = getSavedWords();
  const targetIndex = words.findIndex((w) => w.id === id);
  if (targetIndex === -1) return words;

  const target = words[targetIndex];
  const srsUpdates = calculateNextReview(target, rating);

  const updatedWord: SavedWord = {
    ...target,
    ...srsUpdates,
    lastReviewed: new Date().toISOString(),
  };

  const updatedList = [...words];
  updatedList[targetIndex] = updatedWord;

  persistWords(updatedList);
  return updatedList;
}

/**
 * Updates only the book context metadata for a saved word.
 */
export function updateBookContext(id: string, context: BookContext): SavedWord[] {
  const words = getSavedWords();
  const targetIndex = words.findIndex((w) => w.id === id);
  if (targetIndex === -1) return words;

  const updatedWord: SavedWord = {
    ...words[targetIndex],
    bookContext: context,
  };

  const updatedList = [...words];
  updatedList[targetIndex] = updatedWord;

  persistWords(updatedList);
  return updatedList;
}

/**
 * Deletes a word by id.
 */
export function deleteWord(id: string): SavedWord[] {
  const words = getSavedWords();
  const filtered = words.filter((w) => w.id !== id);
  persistWords(filtered);
  return filtered;
}

/**
 * Exports all words as a formatted JSON file.
 */
export function exportToJSON(): void {
  const words = getSavedWords();
  const blob = new Blob([JSON.stringify(words, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vocab-vault-backup-${getTodayString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports words to CSV format compatible with Anki / Excel.
 */
export function exportToCSV(): void {
  const words = getSavedWords();
  const headers = [
    "Word",
    "Phonetic",
    "First Definition",
    "Part of Speech",
    "Book Title",
    "Sentence Context",
    "Date Added",
    "Mastery",
  ];

  const rows = words.map((w) => {
    const firstMeaning = w.meanings?.[0];
    const def = firstMeaning?.definitions?.[0]?.definition || "";
    const pos = firstMeaning?.partOfSpeech || "";
    const book = w.bookContext?.bookTitle || "";
    const sentence = w.bookContext?.sentence || "";

    const escape = (str: string) => `"${(str || "").replace(/"/g, '""')}"`;

    return [
      escape(w.word),
      escape(w.phonetic),
      escape(def),
      escape(pos),
      escape(book),
      escape(sentence),
      escape(w.dateAdded),
      escape(w.mastery),
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vocab-vault-${getTodayString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Imports words from a JSON file string.
 */
export function importFromJSON(jsonString: string): { count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { count: 0, error: "Uploaded file is not a valid vocabulary list array." };
    }

    const current = getSavedWords();
    const map = new Map<string, SavedWord>();

    current.forEach((w) => map.set(w.word.toLowerCase(), w));
    let addedCount = 0;

    for (const item of parsed) {
      if (item && item.word) {
        const key = item.word.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            ...item,
            id: item.id || `imported-${Date.now()}-${Math.random()}`,
            nextReviewDate: item.nextReviewDate || getTodayString(),
          });
          addedCount++;
        }
      }
    }

    const merged = Array.from(map.values());
    persistWords(merged);
    return { count: addedCount };
  } catch (err: any) {
    return { count: 0, error: err?.message || "Invalid JSON format." };
  }
}
