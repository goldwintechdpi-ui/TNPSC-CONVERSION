import React, { useState } from 'react';
import {
  classify,
  cleanLine,
  normalize,
  tidyText,
  E_CANON,
  TokenKind,
} from '../lib/tamilCleaner';
import { Sparkles, Play, RefreshCw, Check, ArrowRight } from 'lucide-react';

export const AlgorithmLab: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    '1. தமிழ் நாட்டின் zxwq மாநில மரம் எது? 98762\n(A) ஆல மரம் xqy\n(B) பனை மரம்\n(C) வேப்ப மரம் qrtt\n(D) மா மரம்\n(E) விடை தெரியவில்லை'
  );
  const [isAnswerMode, setIsAnswerMode] = useState<boolean>(false);

  const presets = [
    {
      name: 'OCR Noise & Stray Characters',
      text: 'தமிழ் நாட்டின் zxwq மாநில மரம் எது? 98762\n(A) ஆல மரம் xqy\n(B) பனை மரம்\n(C) வேப்ப மரம் qrtt\n(D) மா மரம்\n(E) விடை தெரியவில்லை',
      isAnswer: false,
    },
    {
      name: 'Stray Latin in Tamil Word',
      text: 'பாரதiயார் இயற்றிய நூல் பாரதi தேசம் ஆகும்',
      isAnswer: false,
    },
    {
      name: 'Matching Number Options (Keep Tiny)',
      text: '(A) 3 1 4 2\n(B) 4 3 2 1\n(C) 1 2 3 4',
      isAnswer: true,
    },
    {
      name: 'Bilingual Question Line',
      text: '5. Who founded the Self-Respect Movement? சுயமரியாதை இயக்கம் யாரால் தொடங்கப்பட்டது?',
      isAnswer: false,
    },
  ];

  const lines = inputText.split('\n');
  const cleanedLines = lines.map((ln) => cleanLine(normalize(ln), isAnswerMode));

  const getKindBadgeClass = (kind: TokenKind) => {
    switch (kind) {
      case 'G':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'N':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'T':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'P':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'J':
        return 'bg-rose-50 text-rose-800 border-rose-200 line-through opacity-75';
    }
  };

  const getKindLabel = (kind: TokenKind) => {
    switch (kind) {
      case 'G':
        return 'Good';
      case 'N':
        return 'Num';
      case 'T':
        return 'Tiny';
      case 'P':
        return 'Punct';
      case 'J':
        return 'Junk';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Algorithm & Regex Interactive Sandbox
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
          Directly experiment with the token classification, junk discrimination, and Tamil Unicode normalization algorithms implemented in <code>tamil_pdf_tool.py</code>.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">
          Test Presets:
        </span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputText(preset.text);
              setIsAnswerMode(preset.isAnswer);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-900">
              Input Text (Raw OCR / Scanned String)
            </label>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnswerMode}
                  onChange={(e) => setIsAnswerMode(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                Answer Mode (Strict Latin Junk Filtering)
              </label>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            className="w-full text-xs font-tamil p-3.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all leading-relaxed"
            placeholder="Type or paste text..."
          />

          <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-700">Classification Legend:</div>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <span className="px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                G = Good
              </span>
              <span className="px-1.5 py-0.5 rounded border bg-blue-50 text-blue-800 border-blue-200">
                N = Number
              </span>
              <span className="px-1.5 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-200">
                T = Tiny Tamil
              </span>
              <span className="px-1.5 py-0.5 rounded border bg-purple-50 text-purple-800 border-purple-200">
                P = Allowed Punct
              </span>
              <span className="px-1.5 py-0.5 rounded border bg-rose-50 text-rose-800 border-rose-200">
                J = Junk Dropped
              </span>
            </div>
          </div>
        </div>

        {/* Live Output & Breakdown Panel */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Live Token Breakdown & Neighbor Context Resolution
            </h2>
            <p className="text-xs text-slate-500">
              Each token is classified and resolved according to its surrounding context.
            </p>
          </div>

          <div className="space-y-4">
            {cleanedLines.map((cl, idx) => {
              const origLine = lines[idx];
              if (!origLine.trim()) return null;

              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/60 space-y-3"
                >
                  <div className="text-[11px] font-mono text-slate-500 flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span>Line {idx + 1}</span>
                    <span>
                      Tokens in: {cl.tokensIn} · Removed: {cl.tokensRemoved} (
                      {cl.tokensIn > 0
                        ? `${Math.round((cl.tokensRemoved / cl.tokensIn) * 100)}% junk`
                        : '0%'}
                      )
                    </span>
                  </div>

                  {/* Token Badges */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {cl.tokensInfo.map((tok, tIdx) => (
                      <span
                        key={tIdx}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border font-tamil ${getKindBadgeClass(
                          tok.kind
                        )}`}
                        title={`Token: "${tok.token}" -> Kind: ${getKindLabel(
                          tok.kind
                        )}${tok.cleaned ? ` (cleaned: "${tok.cleaned}")` : ' (dropped)'}`}
                      >
                        <span>{tok.token}</span>
                        <span className="text-[9px] uppercase px-1 rounded bg-black/10 font-bold font-mono">
                          {tok.kind}
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Cleaned Result */}
                  <div className="pt-2 border-t border-slate-200 flex items-start gap-2">
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap mt-0.5">
                      Output:
                    </span>
                    <span className="text-xs font-tamil text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 w-full">
                      {cl.cleanText || (
                        <span className="text-slate-400 italic">
                          (Entire line dropped as junk)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
              TNPSC Option E Specification
            </h3>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 leading-relaxed">
              Standard Canonical Option E: <strong>"{E_CANON}"</strong>. In TNPSC examinations, Option (E) represents "Answer Not Known" / "விடை தெரியவில்லை". The tool automatically canonicalizes OCR variants or corrupted versions to this standardized Tamil string.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
