# VocabVault 📖

> The book reader's personal dictionary and daily spaced revision companion.

**VocabVault** is designed specifically for avid book readers. When you encounter unfamiliar words while reading, paste or type them into VocabVault to instantly hear native pronunciation, view Google-style definitions, attach the sentence context from your book, and retain every word long-term with daily spaced repetition.

---

## ✨ Features

- **Google-Style Meaning & Pronunciation**:
  - Direct native audio pronunciation (US 🇺🇸 & UK 🇬🇧 accents) powered by the Free Dictionary API.
  - Browser **Web Speech API** fallback with zero latency.
  - Phonetic transcription (IPA) and syllable breakdown (e.g., `com·pre·hen·sion`).
  - Definitions grouped by Part of Speech (*noun*, *verb*, *adjective*, etc.) with real-world examples.
  - Clickable synonym and antonym tags to explore related words instantly.
- **Book Context Tracking**:
  - Save the exact sentence, book title, and page/chapter where you encountered the word.
  - Contextual memory clues dramatically improve retention compared to rote memorization.
- **Automated Daily Revision (Spaced Repetition)**:
  - Every day, the app presents a revision word from your search history.
  - Built on the **SuperMemo SM-2** spaced repetition algorithm:
    - 🔴 **Hard**: Reviewed tomorrow (1-day interval).
    - 🟡 **Good**: Reviewed in 3–7 days.
    - 🟢 **Easy**: Mastered (7–30+ days).
  - Quick flip flashcard mode with celebratory confetti on mastery.
- **Complete Word Bank & History**:
  - Searchable and filterable archive of all searched words.
  - Filter by mastery level (*New*, *Learning*, *Reviewing*, *Mastered*) or review priority.
  - Inline audio buttons to re-hear words on demand.
- **Export & Portability**:
  - Export to **JSON** for full backups.
  - Export to **CSV** compatible with Anki flashcard decks and Excel.
  - Import JSON backups on any device.
- **Dark & Light Mode**:
  - Easy on the eyes for evening and bedside reading sessions.

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

VocabVault is a native Next.js application designed to deploy to Vercel in seconds:

### Method 1: Deploy via GitHub (Recommended)

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of VocabVault"
   git branch -M main
   git remote add origin https://github.com/<your-username>/vocab-vault.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. Leave the default settings (Next.js is auto-detected).
5. Click **"Deploy"**.

### Method 2: Deploy via Vercel CLI

```bash
npx vercel
```

---

## 💾 Data Persistence Architecture

VocabVault uses a **Dual-Mode Persistence Model**:
1. **Zero-Setup Client Storage (Default)**:
   - Persists all words, review history, and book notes in your browser via `localStorage` and `IndexedDB`.
   - The app works immediately upon deployment without configuring a database or paying for cloud hosting.
2. **Cloud Database Ready**:
   - Includes backend API endpoints (`/api/dictionary/[word]` with Edge caching and `/api/words`).
   - If you add a PostgreSQL / Turso database URL to `DATABASE_URL` in your Vercel project environment variables, the backend seamlessly switches to cloud database synchronization.
