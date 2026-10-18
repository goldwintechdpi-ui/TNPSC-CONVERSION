import React from 'react';
import {
  Download,
  Terminal,
  CheckCircle2,
  FileCode,
  Play,
  FolderDown,
  Archive,
  Globe,
  Sparkles,
  Type,
} from 'lucide-react';

interface ExePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExePackageModal: React.FC<ExePackageModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              .exe
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Offline Desktop & Windows .EXE Package
              </h2>
              <p className="text-xs text-slate-500">
                100% Offline execution · Pre-configured with Noto Sans Tamil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-base font-semibold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Font Callout Badge */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center gap-2.5">
          <Type className="w-4 h-4 text-emerald-700 shrink-0" />
          <div>
            <strong className="text-emerald-900">Noto Sans Tamil Font Pre-configured:</strong>{' '}
            All outputs (GUI window, Excel <code className="font-mono text-[11px] bg-emerald-100 px-1 py-0.5 rounded">.xlsx</code> cells, Word <code className="font-mono text-[11px] bg-emerald-100 px-1 py-0.5 rounded">.docx</code> runs, and Web text) render using the authentic <strong>Noto Sans Tamil</strong> font.
          </div>
        </div>

        {/* Primary 1: Complete Offline ZIP Package */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">
                  Recommended Package
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-amber-300" />
                  Tamil_PDF_Tool_Offline_Package.zip
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Complete offline bundle: includes <code className="text-amber-200 font-mono">Tamil_PDF_Tool.exe</code>, 1-click batch runners, Python source with Noto Sans Tamil, and offline HTML browser studio.
              </p>
            </div>

            <a
              href="/Tamil_PDF_Tool_Offline_Package.zip"
              download="Tamil_PDF_Tool_Offline_Package.zip"
              className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Download Complete ZIP
            </a>
          </div>
        </div>

        {/* Primary 2: Direct .EXE Download */}
        <div className="p-4 bg-slate-900 text-white rounded-xl shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded">
                  Direct Executable
                </span>
                <h3 className="text-sm font-bold text-white">
                  Tamil_PDF_Tool.exe (Windows Executable)
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Standalone 64-bit Windows executable file ready to run directly on your system.
              </p>
            </div>

            <a
              href="/Tamil_PDF_Tool.exe"
              download="Tamil_PDF_Tool.exe"
              className="py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Download .EXE File
            </a>
          </div>
        </div>

        {/* Primary 3: Offline Single-File HTML Studio */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded">
                  Zero Install
                </span>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  Offline_Tamil_Extractor_Studio.html
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Self-contained single HTML file: runs offline in Chrome/Edge without Python, Node, or Internet!
              </p>
            </div>

            <a
              href="/Offline_Tamil_Extractor_Studio.html"
              download="Offline_Tamil_Extractor_Studio.html"
              className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download Offline HTML
            </a>
          </div>
        </div>

        {/* 1-Click Steps */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            How to Run on Windows (3 Easy Steps):
          </h3>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-900">Download the ZIP or .EXE file</strong> above to any folder on your Windows PC (e.g. <code>C:\TamilPDFTool</code>).
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-900">Double-click <code>Tamil_PDF_Tool.exe</code> or <code>run_offline.bat</code></strong>.
                <div className="text-slate-500 text-[11px] mt-0.5">
                  The application opens instantly with the Noto Sans Tamil interface.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-slate-900">Select your PDF or folder</strong> and click <strong>Extract Questions</strong>.
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Questions are extracted and exported to Excel (.xlsx) and Word (.docx) with Noto Sans Tamil typography.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual File Downloads */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Individual Source & Scripts:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/Build_Tamil_PDF_Tool_EXE.bat"
              download="Build_Tamil_PDF_Tool_EXE.bat"
              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-between shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-xs font-bold">1-Click Windows .BAT</div>
                  <div className="text-[10px] text-slate-400">Build_Tamil_PDF_Tool_EXE.bat</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-300" />
            </a>

            <a
              href="/tamil_pdf_tool.py"
              download="tamil_pdf_tool.py"
              className="p-3 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-xs font-bold">Python Source Code</div>
                  <div className="text-[10px] text-slate-500">tamil_pdf_tool.py (Noto Sans Tamil)</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          <div className="flex justify-between items-center pt-2">
            <a
              href="/README_WINDOWS_EXE.txt"
              download="README_WINDOWS_EXE.txt"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline flex items-center gap-1"
            >
              <FolderDown className="w-3.5 h-3.5" />
              Download Setup Readme (.txt)
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
