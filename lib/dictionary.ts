import { RawDictionaryEntry } from "@/types/vocab";

/**
 * Clean and normalize a word input from book readers
 * (removes surrounding punctuation, quotes, trailing numbers)
 */
export function sanitizeSearchWord(raw: string): string {
  return raw
    .trim()
    .replace(/^["'“‘(\[]+/, "")
    .replace(/["'”’)\].,;:!?]+$/, "")
    .trim();
}

/**
 * Fetches dictionary entries from the Free Dictionary API.
 */
export async function fetchDictionaryEntry(
  word: string
): Promise<{ data?: RawDictionaryEntry[]; error?: string }> {
  const cleanWord = sanitizeSearchWord(word);
  if (!cleanWord) {
    return { error: "Please enter a word to search." };
  }

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        cleanWord
      )}`
    );

    if (res.status === 404) {
      return {
        error: `No definitions found for "${cleanWord}". Check spelling or try a simpler root form.`,
      };
    }

    if (!res.ok) {
      return {
        error: `Dictionary service returned an error (${res.status}). Please try again.`,
      };
    }

    const json = (await res.json()) as RawDictionaryEntry[];
    if (!Array.isArray(json) || json.length === 0) {
      return { error: `No valid definitions found for "${cleanWord}".` };
    }

    return { data: json };
  } catch (err: any) {
    return {
      error:
        err?.message || "Failed to connect to the dictionary service. Please check your connection.",
    };
  }
}
