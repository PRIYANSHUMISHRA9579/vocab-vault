"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  Check,
  AlertCircle,
  Cloud,
} from "lucide-react";
import { exportToJSON, exportToCSV, importFromJSON } from "@/lib/storage";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  totalWords: number;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  totalWords,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importFromJSON(content);
        if (result.error) {
          setImportStatus(`Error: ${result.error}`);
        } else {
          setImportStatus(`Successfully imported ${result.count} words!`);
          onImportComplete();
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-brand-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Data & Backup
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            You currently have <strong>{totalWords} words</strong> saved in your vault. You can back them up or transfer them between devices anytime.
          </p>

          {/* Export Options */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Export Vocabulary
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={exportToJSON}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors text-left"
              >
                <FileCode className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <div>
                  <div>Full JSON</div>
                  <div className="text-[10px] font-normal text-slate-500">Exact backup</div>
                </div>
              </button>

              <button
                type="button"
                onClick={exportToCSV}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors text-left"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <div>Anki / CSV</div>
                  <div className="text-[10px] font-normal text-slate-500">Flashcard decks</div>
                </div>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Restore / Import
            </span>

            <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-500 cursor-pointer bg-slate-50/50 dark:bg-slate-750 transition-colors">
              <Upload className="w-4 h-4 text-brand-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Upload .json backup file
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Deployment Info note */}
          <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Cloud className="w-3.5 h-3.5 text-brand-500" />
              <span>Vercel Ready</span>
            </div>
            <p>
              Your vocabulary automatically persists in your browser and can be synced across any device via JSON backup or by connecting a cloud PostgreSQL / Turso database in Vercel settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
