import React from 'react';
import { FileSpreadsheet, Code2, Sparkles, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: 'studio' | 'lab' | 'walkthrough' | 'specs';
  setActiveTab: (tab: 'studio' | 'lab' | 'walkthrough' | 'specs') => void;
  onQuickLoadSample: () => void;
  onOpenExeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onQuickLoadSample,
  onOpenExeModal,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
            த
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Tamil PDF Question Bank Studio
          </span>
        </div>

        {/* Zone 2: 4 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('studio')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-2 ${
              activeTab === 'studio'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Extractor & Studio
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-2 ${
              activeTab === 'lab'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Algorithm & Regex Lab
          </button>

          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-2 ${
              activeTab === 'walkthrough'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Python Code Walkthrough
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-2 ${
              activeTab === 'specs'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            TNPSC Format Specs
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/Tamil_PDF_Tool.exe"
            download="Tamil_PDF_Tool.exe"
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download Tamil_PDF_Tool.exe directly for Windows"
          >
            <span className="font-mono text-[10px] bg-white/20 px-1 py-0.5 rounded">.EXE</span>
            Download .EXE
          </a>

          <button
            onClick={onOpenExeModal}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Package Setup
          </button>

          <button
            onClick={onQuickLoadSample}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            Load Sample Paper
          </button>
        </div>
      </div>
    </header>
  );
};
