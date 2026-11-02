import { Phonetic, RawDictionaryEntry } from "@/types/vocab";

/**
 * Extracts the best audio URL from the phonetics array.
 * Prioritizes US accents, then UK, then any valid audio URL.
 */
export function extractBestAudio(phonetics?: Phonetic[]): string | undefined {
  if (!phonetics || phonetics.length === 0) return undefined;

  // 1. Look for US accent
  const usAudio = phonetics.find(
    (p) => p.audio && (p.audio.includes("-us.mp3") || p.audio.includes("/us/"))
  );
  if (usAudio?.audio) return usAudio.audio;

  // 2. Look for UK accent
  const ukAudio = phonetics.find(
    (p) => p.audio && (p.audio.includes("-uk.mp3") || p.audio.includes("/uk/"))
  );
  if (ukAudio?.audio) return ukAudio.audio;

  // 3. Any non-empty audio string ending in .mp3 or starting with http
  const anyAudio = phonetics.find(
    (p) => p.audio && p.audio.trim().length > 0 && p.audio.startsWith("http")
  );
  return anyAudio?.audio;
}

/**
 * Finds the cleanest phonetic text representation.
 */
export function extractBestPhonetic(entry: RawDictionaryEntry): string {
  if (entry.phonetic && entry.phonetic.trim()) {
    return entry.phonetic.trim();
  }

  if (entry.phonetics && entry.phonetics.length > 0) {
    const withText = entry.phonetics.find((p) => p.text && p.text.trim().length > 0);
    if (withText?.text) return withText.text.trim();
  }

  return "";
}

/**
 * Approximates syllable division for Google-style visual formatting (e.g., com·pre·hen·sion).
 */
export function formatSyllables(word: string): string {
  const cleanWord = word.trim().toLowerCase();
  if (cleanWord.length <= 3) return word;

  // Basic English syllable heuristic rules
  const syllables = cleanWord
    .replace(/(?:[^laeiouy]|ed|es|e)$/gi, "")
    .replace(/^y/gi, "")
    .match(/[aeiouy]{1,2}/gi);

  const count = syllables ? syllables.length : 1;
  if (count <= 1) return word;

  // Divide into chunks using common prefix/suffix patterns
  const result = cleanWord
    .replace(/([bcdfghjklmnpqrstvwxyz])([bcdfghjklmnpqrstvwxyz])/gi, "$1·$2")
    .replace(/([aeiouy])([bcdfghjklmnpqrstvwxyz][aeiouy])/gi, "$1·$2")
    .replace(/··+/g, "·");

  // Keep original casing
  const parts = result.split("·");
  let charIndex = 0;
  const formatted: string[] = [];
  for (const part of parts) {
    formatted.push(word.slice(charIndex, charIndex + part.length));
    charIndex += part.length;
  }

  return formatted.join("·") || word;
}

/**
 * Speaks a word using the native browser Web Speech API.
 * Provides selectable US/UK voices as a reliable fallback.
 */
export function speakWord(word: string, accent: "en-US" | "en-GB" = "en-US"): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = accent;
    utterance.rate = 0.88; // Slightly slower for crisp vocabulary articulation

    // Select suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang === accent || v.lang.startsWith(accent.split("-")[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}
