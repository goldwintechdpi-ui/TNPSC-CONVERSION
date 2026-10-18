import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  ChevronDown,
  ChevronUp,
  XCircle,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';

export interface BatchItemState {
  id: string;
  name: string;
  size: number;
  status: 'waiting' | 'reading' | 'extracting' | 'completed' | 'error';
  currentPage?: number;
  totalPages?: number;
  questionsCount?: number;
  outputName?: string;
  error?: string;
}

interface BatchProgressBarProps {
  isProcessing: boolean;
  currentFileName: string;
  currentFileIndex: number;
  totalFiles: number;
  currentPage: number;
  totalPages: number;
  currentQuestion: number;
  totalQuestions: number;
  stageMessage: string;
  stage: 'idle' | 'reading' | 'cleaning' | 'extracting' | 'exporting' | 'completed' | 'error';
  percentage: number;
  batchItems?: BatchItemState[];
  onCancel?: () => void;
  onExportItem?: (item: BatchItemState) => void;
}

export const BatchProgressBar: React.FC<BatchProgressBarProps> = ({
  isProcessing,
  currentFileName,
  currentFileIndex,
  totalFiles,
  currentPage,
  totalPages,
  currentQuestion,
  totalQuestions,
  stageMessage,
  stage,
  percentage,
  batchItems = [],
  onCancel,
  onExportItem,
}) => {
  const [showQueue, setShowQueue] = useState<boolean>(true);

  if (!isProcessing && stage !== 'completed' && stage !== 'error') {
    return null;
  }

  const isCompleted = stage === 'completed';
  const isError = stage === 'error';

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-indigo-500/20 space-y-4 transition-all">
      {/* Top Header & Stage Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {isCompleted
                  ? 'Batch PDF Processing Completed'
                  : isError
                  ? 'Processing Interrupted'
                  : totalFiles > 1
                  ? `Batch Processing Tasks (${currentFileIndex} of ${totalFiles} Files)`
                  : 'Processing PDF Document (100 Questions Offline)'}
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                100% Offline Engine
              </span>
            </div>
            <p className="text-xs text-indigo-200/70 truncate max-w-md sm:max-w-xl font-mono mt-0.5">
              {currentFileName || 'Processing active document...'}
            </p>
          </div>
        </div>

        {/* Action Controls & Percentage */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-right">
            <div className="text-xl font-bold font-mono text-indigo-300">
              {Math.min(100, Math.round(percentage))}%
            </div>
            <div className="text-[10px] text-slate-400">
              {isCompleted ? 'Completed' : 'Running...'}
            </div>
          </div>

          {onCancel && isProcessing && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Cancel batch processing"
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Animated Real-Time Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-indigo-200">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {stageMessage || 'Analyzing document stream...'}
          </span>
          <span className="font-mono text-[11px] text-indigo-300">
            {totalPages > 0 && `Page ${currentPage || 1}/${totalPages} · `}
            {totalQuestions > 0 && `Question ${currentQuestion || 0}/${totalQuestions}`}
          </span>
        </div>

        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                : isError
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 animate-pulse'
            }`}
            style={{ width: `${Math.max(4, Math.min(100, percentage))}%` }}
          />
        </div>
      </div>

      {/* 4 Pipeline Micro-Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        <div
          className={`p-2 rounded-xl border transition-all ${
            stage === 'reading' || percentage >= 25
              ? 'bg-indigo-900/40 border-indigo-400/40 text-indigo-200'
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          <div className="font-semibold text-[11px] flex items-center gap-1">
            <FileText className="w-3 h-3" /> 1. PDF Parser
          </div>
          <div className="text-[10px] text-white/70 mt-0.5">
            {totalPages > 0 ? `${totalPages} Page(s)` : 'Multi-page read'}
          </div>
        </div>

        <div
          className={`p-2 rounded-xl border transition-all ${
            stage === 'cleaning' || percentage >= 50
              ? 'bg-indigo-900/40 border-indigo-400/40 text-indigo-200'
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          <div className="font-semibold text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> 2. Tamil Normalizer
          </div>
          <div className="text-[10px] text-white/70 mt-0.5">Noto Sans Tamil</div>
        </div>

        <div
          className={`p-2 rounded-xl border transition-all ${
            stage === 'extracting' || percentage >= 75
              ? 'bg-indigo-900/40 border-indigo-400/40 text-indigo-200'
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          <div className="font-semibold text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 3. 100 Questions
          </div>
          <div className="text-[10px] text-white/70 mt-0.5">
            {currentQuestion > 0 ? `${currentQuestion}/100 Extracted` : 'Q1 to Q100 Rule'}
          </div>
        </div>

        <div
          className={`p-2 rounded-xl border transition-all ${
            isCompleted || percentage >= 95
              ? 'bg-emerald-900/40 border-emerald-400/40 text-emerald-200'
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          <div className="font-semibold text-[11px] flex items-center gap-1">
            <Download className="w-3 h-3" /> 4. File Output
          </div>
          <div className="text-[10px] text-white/70 mt-0.5 truncate">
            {currentFileName ? `${currentFileName.replace(/\.[^/.]+$/, '')}.xlsx` : '.xlsx / .docx'}
          </div>
        </div>
      </div>

      {/* Batch Files Queue Drawer (if multiple files exist) */}
      {batchItems.length > 0 && (
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => setShowQueue(!showQueue)}
            className="flex items-center justify-between w-full text-xs text-indigo-300 hover:text-white font-medium cursor-pointer py-1"
          >
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>
                Batch Queue ({batchItems.filter((b) => b.status === 'completed').length}/
                {batchItems.length} Finished)
              </span>
            </div>
            {showQueue ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showQueue && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {batchItems.map((item, idx) => {
                const isItemActive = item.name === currentFileName && isProcessing;
                const outputName = item.outputName || `${item.name.replace(/\.[^/.]+$/, '')}.xlsx`;

                return (
                  <div
                    key={item.id || idx}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors border ${
                      isItemActive
                        ? 'bg-indigo-500/20 border-indigo-400/40 text-white'
                        : item.status === 'completed'
                        ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-100'
                        : item.status === 'error'
                        ? 'bg-rose-950/30 border-rose-500/20 text-rose-200'
                        : 'bg-white/5 border-white/5 text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div className="shrink-0">
                        {isItemActive ? (
                          <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                        ) : item.status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : item.status === 'error' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate font-mono text-[11px]">{item.name}</div>
                        <div className="text-[10px] text-white/50 flex items-center gap-1.5">
                          <span>{Math.round(item.size / 1024)} KB</span>
                          {item.totalPages && <span>· {item.totalPages} Pages</span>}
                          <span>· Output: {outputName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.questionsCount !== undefined && item.questionsCount > 0 && (
                        <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-indigo-200">
                          {item.questionsCount} Qs
                        </span>
                      )}

                      {item.status === 'completed' && onExportItem && (
                        <button
                          onClick={() => onExportItem(item)}
                          className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Download className="w-2.5 h-2.5" /> Export
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
