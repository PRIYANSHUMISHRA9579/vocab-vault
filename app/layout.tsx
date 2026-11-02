import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VocabVault - Book Reader's Dictionary & Spaced Revision",
  description:
    "Look up word meanings, syllables, and Google-style audio pronunciation while reading books. Track every word and revise daily with spaced repetition.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
