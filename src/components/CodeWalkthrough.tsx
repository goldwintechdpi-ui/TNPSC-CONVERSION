import React, { useState } from 'react';
import {
  Code2,
  Cpu,
  Columns3,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const CodeWalkthrough: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: '1. Architecture & Purpose', icon: Layers },
    { id: 'ocr-engine', title: '2. CRAFT + PARSeq OCR Pipeline', icon: Cpu },
    { id: 'columns', title: '3. Multi-Column Gutter Detection', icon: Columns3 },
    { id: 'cleaner', title: '4. Heuristic Junk & Tamil Normalization', icon: Filter },
    { id: 'parser', title: '5. Question & Option State Machine', icon: Code2 },
    { id: 'qa-review', title: '6. Quality Auditor & Review Sheet', icon: ShieldCheck },
    { id: 'exporter', title: '7. Multi-Format Exporter & Formulas', icon: FileSpreadsheet },
    { id: 'edge-cases', title: '8. Critical Edge Cases & Web Upgrade', icon: Zap },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Comprehensive Code Analysis: <code className="text-xl font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">tamil_pdf_tool.py</code>
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
          A systematic breakdown of the Python batch examination OCR and question bank extraction tool. Explore how CRAFT text detection, PARSeq Tamil recognition, column gutter histograms, heuristic junk filtering, and Excel formulas operate in harmony.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-3 shadow-xs sticky top-24">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
            Code Modules & Sections
          </div>
          <div className="space-y-1">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = selectedSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(sec.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 px-3">
            <div className="text-xs text-slate-500 space-y-2">
              <div className="font-semibold text-slate-800">File Statistics</div>
              <div className="flex justify-between font-mono text-[11px]">
                <span>Total Lines:</span>
                <span>656 lines</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span>Core Libraries:</span>
                <span>ocr_tamil, fitz, openpyxl, docx</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span>Architecture:</span>
                <span>Single-file GUI + Batch Pipeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
          {selectedSection === 'overview' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Module 1</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">High-Level Purpose & Architectural Blueprint</h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                <code>tamil_pdf_tool.py</code> is a specialized, single-file desktop utility engineered to solve a major challenge in competitive examination prep (specifically <strong>TNPSC, TRB, and Tamil Nadu government recruitment exams</strong>): converting messy, scanned, two-column PDF question papers into structured question banks for test platforms and databases.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="font-semibold text-slate-900 text-sm mb-1">Input Specifications</div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>PDF files (multi-page) or raw images (PNG, JPG, TIFF)</li>
                    <li>2-column examination layout typical of TNPSC</li>
                    <li>Tamil script, bilingual English/Tamil, or English-only</li>
                    <li>Question numbers ranging typically from 1 to 100</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="font-semibold text-slate-900 text-sm mb-1">Output Artifacts</div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Excel <code>.xlsx</code> with 3 dedicated sheets</li>
                    <li>Word <code>.docx</code> formatted document</li>
                    <li>Clean text <code>.txt</code> file</li>
                    <li>Autogenerated Question ID formula: <code>=CONCATENATE(A{`{r}`},"-",B{`{r}`},"-",D{`{r}`})</code></li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Processing Pipeline Flow</h3>
                <div className="flex flex-col sm:flex-row items-center gap-2 text-xs font-mono text-slate-700 bg-slate-100 p-3 rounded-lg overflow-x-auto">
                  <span className="bg-white px-2 py-1 rounded shadow-2xs font-semibold">PyMuPDF (150 DPI)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="bg-white px-2 py-1 rounded shadow-2xs font-semibold">CRAFT Detection</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="bg-white px-2 py-1 rounded shadow-2xs font-semibold">PARSeq OCR Batch</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="bg-white px-2 py-1 rounded shadow-2xs font-semibold">Gutter & Column Sort</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="bg-white px-2 py-1 rounded shadow-2xs font-semibold">Regex Parsing & Review</span>
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'ocr-engine' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Module 2</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">CRAFT Word Detection + PARSeq Recognition Batching</h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                Rather than treating OCR as a naive whole-page text recognition call, the script directly taps into the internal layers of the <code>ocr_tamil</code> library:
              </p>

              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Step 1: PyMuPDF Page Rasterization (150 DPI Default)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    <code>iter_pdf_pages</code> uses <code>fitz.Matrix(zoom, zoom)</code> where <code>zoom = dpi / 72.0</code>. At 150 DPI, zoom is ~2.08x, providing a sweet spot between character sharpness for Tamil vowel signs (கொ, கே, கௌ) and GPU memory consumption.
                  </p>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded text-[11px] font-mono overflow-x-auto">
{`pix = doc[i].get_pixmap(matrix=fitz.Matrix(zoom, zoom), colorspace=fitz.csRGB, alpha=False)
arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
yield i + 1, np.ascontiguousarray(arr[:, :, ::-1])  # RGB -> BGR for OpenCV`}</pre>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Step 2: Pooled Multi-Page Batch Recognition
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Instead of passing crops page by page, <code>recognize_pages</code> pools word crops from <code>page_batch</code> (e.g. 4 pages at once, yielding ~1,200 words) and feeds them into <code>ocr.text_recognize_batch(pool)</code> in batches of 32 or 64. This maximizes PyTorch Tensor utilization on GPUs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'columns' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Module 3</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Multi-Column Gutter Detection via 400-Bin Histogram</h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                Standard OCR reads horizontally from top to bottom across the entire page width. In a 2-column examination paper, this causes question lines from Column 1 and Column 2 to interlace into nonsense! The script includes an elegant geometric gutter detector:
              </p>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                <div className="font-semibold text-slate-900 text-sm">How <code>find_gutters</code> Works:</div>
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside">
                  <li>Divides the horizontal width into <strong>400 discrete bins</strong>.</li>
                  <li>Projects the bounding box range <code>[x1, x2]</code> of every word box into the bins: <code>cover[a:b + 1] += 1</code>.</li>
                  <li>Scans between 15% and 85% of page width to find consecutive empty bins (<code>cover[i] &lt;= tolerance</code>).</li>
                  <li>Ensures the gutter has a minimum width (at least 2.5% of page width) and that at least 20% of words exist on both sides.</li>
                  <li>Words are sorted into column buckets using <code>np.searchsorted(splits, cx)</code> and then line-clustered using median box height (<code>0.6 * mh</code>).</li>
                </ol>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-3 rounded text-[11px] font-mono overflow-x-auto">
{`# Gutter tolerance allows for occasional stray wide boxes
tol = max(1, int(0.01 * n))
min_w = max(3, int(min_gap * bins))
# Verify real content exists on both sides
if left >= 0.2 * n and (n - left) >= 0.2 * n:
    gutters.append(x)`}</pre>
            </div>
          )}

          {selectedSection === 'cleaner' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Module 4</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Heuristic Junk Filtering & Tamil Unicode Normalization</h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                OCR on scanned Tamil papers frequently creates noise: broken letters, stray Latin characters injected into Tamil syllables, and random floating punctuation. The script employs a sophisticated token classifier:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="border border-emerald-200 bg-emerald-50 p-2.5 rounded-lg">
                  <div className="font-bold text-emerald-800 text-base">G</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Good Token</div>
                  <div className="text-[10px] text-slate-500">Passed words</div>
                </div>
                <div className="border border-blue-200 bg-blue-50 p-2.5 rounded-lg">
                  <div className="font-bold text-blue-800 text-base">N</div>
                  <div className="text-[11px] text-blue-700 mt-0.5 font-medium">Number</div>
                  <div className="text-[10px] text-slate-500">Pure digits</div>
                </div>
                <div className="border border-amber-200 bg-amber-50 p-2.5 rounded-lg">
                  <div className="font-bold text-amber-800 text-base">T</div>
                  <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Tiny Tamil</div>
                  <div className="text-[10px] text-slate-500">&le; 2 letters</div>
                </div>
                <div className="border border-purple-200 bg-purple-50 p-2.5 rounded-lg">
                  <div className="font-bold text-purple-800 text-base">P</div>
                  <div className="text-[11px] text-purple-700 mt-0.5 font-medium">Punctuation</div>
                  <div className="text-[10px] text-slate-500">Colons, dashes</div>
                </div>
                <div className="border border-rose-200 bg-rose-50 p-2.5 rounded-lg">
                  <div className="font-bold text-rose-800 text-base">J</div>
                  <div className="text-[11px] text-rose-700 mt-0.5 font-medium">Junk</div>
                  <div className="text-[10px] text-slate-500">Dropped noise</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm">Key Normalization Rules</h3>
                <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                  <li><strong>Unicode Range:</strong> Validates characters against <code>\u0B80-\u0BFF</code> (Tamil block).</li>
                  <li><strong>Invisible Character Strip:</strong> Removes zero-width spaces (<code>\u200B</code>), soft hyphens (<code>\u00AD</code>), and directional overrides.</li>
                  <li><strong>Latin within Tamil:</strong> If stray Latin letters are detected embedded in a Tamil word (e.g. <code>பாரதiயார்</code>), the Latin chars are stripped to salvage the word.</li>
                  <li><strong>English Vowel Ratio:</strong> If <code>pyspellchecker</code> is absent, computes vowel-to-length ratio: must be between <strong>28% and 65%</strong>, with no 4-consonant clusters.</li>
                  <li><strong>Contextual Preservation:</strong> Isolated numbers with junk on both sides are dropped; numbers adjacent to real words or options (like matching question numbers <code>3 1 4 2</code>) are preserved.</li>
                </ul>
              </div>
            </div>
          )}

          {selectedSection === 'parser' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Module 5</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Question & Option State Machine</h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                The extraction logic in <code>parse_questions</code> runs a robust state machine that iterates through ordered lines, tracking question boundaries and option marks:
              </p>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="border-l-2 border-indigo-500 pl-3 py-1">
                  <strong className="text-slate-900">Question Header:</strong> <code>{'_Q_HEAD = re.compile(r"^\\s*(\\d{1,3})\\s*([.)]|,)\\s*(.*)$")'}</code>. Matches numbers 1-999 followed by dot, closing parenthesis, or comma.
                </div>
                <div className="border-l-2 border-indigo-500 pl-3 py-1">
                  <strong className="text-slate-900">Sequence Continuity:</strong> Accepts the next question if its number is between <code>{'cur["n"] < n <= cur["n"] + 5'}</code> and either at least two options have been seen or the line count exceeded 12 lines.
                </div>
                <div className="border-l-2 border-indigo-500 pl-3 py-1">
                  <strong className="text-slate-900">Option Mark:</strong> <code>{'_OPT_MARK = re.compile(r"(?:(?<=\\s)|^)\\(\\s*([A-E])\\s*\\)")'}</code>. Splits lines at <code>(A)</code>, <code>(B)</code>, <code>(C)</code>, <code>(D)</code>, <code>(E)</code>.
                </div>
                <div className="border-l-2 border-indigo-500 pl-3 py-1">
                  <strong className="text-slate-900">Canonical TNPSC Option E:</strong> If label is 'E', the text is canonicalized to <strong>"விடை தெரியவில்லை"</strong> (the mandated TNPSC choice for "Answer not known").
                </div>
                <div className="border-l-2 border-indigo-500 pl-3 py-1">
                  <strong className="text-slate-900">Table Header Handling:</strong> Matches <code>(a) (b) (c) (d)</code> column headers for match-the-following questions.
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'qa-review' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Module 6</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Quality Assurance & Automated "Needs Review" Logging</h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                Rather than silently exporting corrupted or incomplete questions, <code>extract_questions</code> runs a validator that populates a dedicated <strong>"Needs review"</strong> sheet in Excel:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900">Short Question Text:</span>
                    <span className="text-slate-600 ml-1.5">Flags any question stem shorter than 8 characters (often caused by an OCR header cut-off).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900">High Junk Ratio:</span>
                    <span className="text-slate-600 ml-1.5">If <code>removed_tokens / total_tokens &gt;= 0.25</code> (25% or more discarded as junk), prompts user to manually verify wording.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900">Missing Standard Options:</span>
                    <span className="text-slate-600 ml-1.5">Checks whether any of (A), (B), (C), (D) are absent (e.g. "options missing: C, D").</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900">Missing Question Sequence Numbers:</span>
                    <span className="text-slate-600 ml-1.5">If a number in range <code>lo..hi</code> is absent, explicitly records: "Question number not found in the PDF text".</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'exporter' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Module 7</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Multi-Format Exporter with Excel Dynamic Formulas</h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                The Excel output generated by <code>save_questions_xlsx</code> is engineered for direct import into online examination portals (e.g. Moodle, TestPress, Classplus, or MySQL databases):
              </p>

              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <div className="bg-slate-100 px-4 py-2 font-semibold text-slate-800 border-b border-slate-200">
                  Target Excel Sheet Schema: "Questions"
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-7 gap-2 font-mono text-[11px] font-bold text-slate-700 border-b pb-2">
                    <div>Col A</div>
                    <div>Col B</div>
                    <div>Col C</div>
                    <div>Col D</div>
                    <div>Col E</div>
                    <div>Col F</div>
                    <div>Col G</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 font-mono text-[11px] text-slate-600 pt-1">
                    <div>TestSeries</div>
                    <div>QuestionBank</div>
                    <div>QuestionNo</div>
                    <div>Number</div>
                    <div>Question</div>
                    <div>Anwers</div>
                    <div>CorrectAnswer</div>
                  </div>
                  <div className="mt-3 p-2.5 bg-slate-50 rounded text-slate-600 text-[11px]">
                    <strong>Dynamic Formula in Column C:</strong> <code>=CONCATENATE(A2,"-",B2,"-",D2)</code> yields unique database keys like <code>TNPSC-20242-1</code>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'edge-cases' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Module 8</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Critical Edge Cases & The Gemini Vision Web Upgrade</h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                While the Python desktop tool is impressively engineered, running CRAFT + PARSeq locally has several inherent real-world limitations:
              </p>

              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="font-semibold text-slate-900 text-sm mb-1">Local Python Bottlenecks:</div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Requires PyTorch + CUDA GPU (~3GB download); very slow on CPU (10-20 seconds per page).</li>
                    <li>CRAFT box clustering occasionally splits complex Tamil conjunct letters (e.g. <code>க் + ஷ = க்ஷ</code> or <code>ஸ்ரீ</code>).</li>
                    <li>Complex mathematical equations and tables across column gutters can confuse reading order.</li>
                  </ul>
                </div>

                <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50/50">
                  <div className="font-semibold text-indigo-900 text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    How this Studio Upgrades the Experience:
                  </div>
                  <ul className="text-xs text-indigo-900/80 space-y-1.5 list-disc list-inside">
                    <li><strong>Dual Engine:</strong> Run the exact rule-based Python algorithms client-side OR use <code>gemini-3.8-flash</code> Vision for flawless multi-column Tamil OCR.</li>
                    <li><strong>Interactive Data Grid:</strong> Edit any extracted question, fix typos, or set correct answer before downloading.</li>
                    <li><strong>Zero Install:</strong> Works directly in the browser with drag & drop PDF rasterization, export to real <code>.xlsx</code> with formulas, <code>.docx</code>, <code>.txt</code>, and <code>.json</code>.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
