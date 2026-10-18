import React from 'react';
import { BookOpen, FileSpreadsheet, CheckCircle2, HelpCircle } from 'lucide-react';
import { E_CANON } from '../lib/tamilCleaner';

export const FormatSpecs: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          TNPSC & Examination Question Bank Standards
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
          Technical specifications for Tamil Nadu Public Service Commission (TNPSC), TRB, and competitive examination question bank architectures, OCR handling rules, and database schema mappings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: 5-Option Mandate */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
              E
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                The 5-Option Format & Option (E) Mandate
              </h2>
              <p className="text-xs text-slate-500">
                TNPSC Examination Regulatory Order
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            In TNPSC competitive examinations (Group I, II, IV, VAO), candidates are provided with <strong>five distinct options</strong> (A, B, C, D, E) on the OMR answer sheet:
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 font-mono">
            <div className="text-slate-800">
              (A) முதல் விடை (Option A)
            </div>
            <div className="text-slate-800">
              (B) இரண்டாம் விடை (Option B)
            </div>
            <div className="text-slate-800">
              (C) மூன்றாம் விடை (Option C)
            </div>
            <div className="text-slate-800">
              (D) நான்காம் விடை (Option D)
            </div>
            <div className="text-indigo-700 font-bold">
              (E) {E_CANON} (Answer Not Known)
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Candidates who do not know the correct answer must shade Option (E) to avoid negative evaluation penalties. The extractor strictly normalizes any noisy OCR representation of this option to <strong>"{E_CANON}"</strong>.
          </p>
        </div>

        {/* Card 2: Question ID Formula */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              fx
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Composite Key Formula in Excel
              </h2>
              <p className="text-xs text-slate-500">
                Formula Generation for Database Imports
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            When migrating questions into relational databases (PostgreSQL/MySQL) or online exam platforms (Moodle, TestPress), every question requires a globally unique identifier (UUID or composite key).
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 font-mono">
            <div className="text-slate-500 text-[11px]">Excel Formula in Column C:</div>
            <div className="text-emerald-700 font-bold bg-white p-2 rounded border border-slate-200">
              =CONCATENATE(A2, "-", B2, "-", D2)
            </div>
            <div className="text-slate-600 text-[11px] pt-1">
              Example Evaluation: <span className="font-semibold text-slate-900">TNPSC-20242-45</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            This prevents collisions when multiple sets of test series and question banks are merged into a master enterprise spreadsheet.
          </p>
        </div>
      </div>

      {/* Target Excel Schema */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">
              Master Excel Workbook Schema Specification
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            3 Sheets · Frozen Headers · Auto Widths
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 font-semibold text-slate-700">
              <tr>
                <th className="px-4 py-2.5">Column</th>
                <th className="px-4 py-2.5">Field Name</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Sample Value</th>
                <th className="px-4 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
              <tr>
                <td className="px-4 py-2 font-bold text-slate-900">A</td>
                <td className="px-4 py-2">TestSeries</td>
                <td className="px-4 py-2">String</td>
                <td className="px-4 py-2">TNPSC-G4</td>
                <td className="px-4 py-2 font-sans">Examination or test series identification code</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-slate-900">B</td>
                <td className="px-4 py-2">QuestionBank</td>
                <td className="px-4 py-2">String / Int</td>
                <td className="px-4 py-2">20242</td>
                <td className="px-4 py-2 font-sans">Subject or question bank accession number</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-slate-900">C</td>
                <td className="px-4 py-2">QuestionNo</td>
                <td className="px-4 py-2">Formula</td>
                <td className="px-4 py-2">=CONCATENATE(A2,"-",B2,"-",D2)</td>
                <td className="px-4 py-2 font-sans">Unique composite key for database relational lookups</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-slate-900">D</td>
                <td className="px-4 py-2">Number</td>
                <td className="px-4 py-2">Integer</td>
                <td className="px-4 py-2">1</td>
                <td className="px-4 py-2 font-sans">Sequential question order number (1..100)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-slate-900">E</td>
                <td className="px-4 py-2">Question</td>
                <td className="px-4 py-2">Text</td>
                <td className="px-4 py-2 font-tamil">செந்தமிழே! உயிரே!...</td>
                <td className="px-4 py-2 font-sans">Question stem only (no options or numbers)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-slate-900">F</td>
                <td className="px-4 py-2">Anwers</td>
                <td className="px-4 py-2">Text (Multi-line)</td>
                <td className="px-4 py-2 font-tamil">(A) பாரதியார்\n(B)...</td>
                <td className="px-4 py-2 font-sans">Clean list of options (A)-(E) separated by newline</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold text-slate-900">G</td>
                <td className="px-4 py-2">CorrectAnswer</td>
                <td className="px-4 py-2">Char / Null</td>
                <td className="px-4 py-2">B</td>
                <td className="px-4 py-2 font-sans">Answer key code if marked; otherwise left blank</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
