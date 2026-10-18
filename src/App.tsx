import React, { useState } from 'react';
import { Header } from './components/Header';
import { ExtractorStudio } from './components/ExtractorStudio';
import { AlgorithmLab } from './components/AlgorithmLab';
import { CodeWalkthrough } from './components/CodeWalkthrough';
import { FormatSpecs } from './components/FormatSpecs';
import { ExePackageModal } from './components/ExePackageModal';
import { SAMPLE_PAPERS } from './lib/samplePapers';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'lab' | 'walkthrough' | 'specs'>('studio');
  const [isExeModalOpen, setIsExeModalOpen] = useState<boolean>(false);

  const handleQuickLoadSample = () => {
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar following Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickLoadSample={handleQuickLoadSample}
        onOpenExeModal={() => setIsExeModalOpen(true)}
      />

      <ExePackageModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'studio' && <ExtractorStudio />}
        {activeTab === 'lab' && <AlgorithmLab />}
        {activeTab === 'walkthrough' && <CodeWalkthrough />}
        {activeTab === 'specs' && <FormatSpecs />}
      </main>

      {/* Minimal clean footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Tamil PDF Question Bank Studio · Batch OCR & Exam Extractor
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('walkthrough')}
              className="hover:text-slate-900 transition-colors"
            >
              Python Source Review
            </button>
            <button
              onClick={() => setActiveTab('lab')}
              className="hover:text-slate-900 transition-colors"
            >
              Algorithm Sandbox
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className="hover:text-slate-900 transition-colors"
            >
              TNPSC Standards
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
