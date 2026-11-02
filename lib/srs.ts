import { SavedWord, ReviewRating, MasteryLevel } from "@/types/vocab";

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Adds N days to a date string (YYYY-MM-DD).
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates updated Spaced Repetition values based on the SuperMemo SM-2 algorithm.
 */
export function calculateNextReview(
  word: SavedWord,
  rating: ReviewRating
): {
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: string;
  mastery: MasteryLevel;
  reviewCount: number;
} {
  const today = getTodayString();
  let intervalDays = word.intervalDays || 1;
  let easeFactor = word.easeFactor || 2.5;
  const reviewCount = (word.reviewCount || 0) + 1;
  let mastery: MasteryLevel = word.mastery || "learning";

  switch (rating) {
    case "hard":
      // Reset interval to 1 day
      intervalDays = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      mastery = "learning";
      break;

    case "good":
      if (word.reviewCount === 0 || intervalDays <= 1) {
        intervalDays = 3;
      } else if (intervalDays === 3) {
        intervalDays = 7;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      mastery = intervalDays >= 14 ? "reviewing" : "learning";
      break;

    case "easy":
      if (word.reviewCount === 0 || intervalDays <= 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor * 1.3);
      }
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      mastery = intervalDays >= 21 ? "mastered" : "reviewing";
      break;
  }

  const nextReviewDate = addDays(today, intervalDays);

  return {
    intervalDays,
    easeFactor,
    nextReviewDate,
    mastery,
    reviewCount,
  };
}

/**
 * Filters words that are due for revision today or overdue.
 */
export function getDueWords(words: SavedWord[]): SavedWord[] {
  const today = getTodayString();
  return words
    .filter((w) => !w.nextReviewDate || w.nextReviewDate <= today)
    .sort((a, b) => {
      // Prioritize most overdue first
      const dateA = a.nextReviewDate || "1970-01-01";
      const dateB = b.nextReviewDate || "1970-01-01";
      return dateA.localeCompare(dateB);
    });
}

/**
 * Selects the single "Daily Revision Word" for today.
 * If multiple are due, picks the most overdue / least reviewed.
 * If none are due, picks a random or least-reviewed word from the vocabulary so there's always a word for revision.
 */
export function getDailyRevisionWord(words: SavedWord[]): SavedWord | null {
  if (words.length === 0) return null;

  const dueWords = getDueWords(words);
  if (dueWords.length > 0) {
    return dueWords[0];
  }

  // If nothing is due today, select a word with lowest reviewCount or random
  const sortedByReview = [...words].sort(
    (a, b) => (a.reviewCount || 0) - (b.reviewCount || 0)
  );

  // Pick deterministic word for the day based on day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24
  );
  const index = dayOfYear % sortedByReview.length;
  return sortedByReview[index];
}
