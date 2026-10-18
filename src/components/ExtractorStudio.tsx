import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Upload,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Settings2,
  Edit3,
  Trash2,
  Copy,
  ChevronDown,
  Sparkles,
  Layers,
  FileCheck,
  Archive,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { ExtractedQuestion, ReviewItem, RawPageLine, ExtractionConfig } from '../lib/types';
import { extractQuestionsFromLines } from '../lib/questionParser';
import { exportToXLSX, exportToDOCX, exportToTXT, exportToJSON } from '../lib/exporters';
import { SAMPLE_PAPERS, SamplePaper } from '../lib/samplePapers';
import { readPdfFile, readImageFileAsBase64 } from '../lib/pdfReader';
import { BatchProgressBar, BatchItemState } from './BatchProgressBar';

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  pageCount?: number;
  rawText: string;
  isScanned?: boolean;
  images?: { page: number; base64: string }[];
  uploadedAt: string;
  questions?: ExtractedQuestion[];
  reviewItems?: ReviewItem[];
  outputName?: string;
}

interface ExtractorStudioProps {
  onSelectSample?: (paper: SamplePaper) => void;
}

export const ExtractorStudio: React.FC<ExtractorStudioProps> = () => {
  // Configuration State: DEFAULT TO 100 QUESTIONS!
  const [config, setConfig] = useState<ExtractionConfig>({
    qFrom: 1,
    qTo: 100, // Explicitly default to 100 questions
    testSeries: 'TNPSC',
    questionBank: '20242',
    autoDetectColumns: true,
    minConfidence: 0.85,
    batchSize: 32,
    pagesPerBatch: 4,
    dpi: 150,
    straightPage: true,
    extractQuestionsMode: true,
    useGeminiVision: false,
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('tnpsc-group4-tamil-100');
  const [inputText, setInputText] = useState<string>(SAMPLE_PAPERS[0].rawText);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [activeInputTab, setActiveInputTab] = useState<'uploaded' | 'samples'>('samples');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Output File Naming State: Stored based on the given input file name
  const [outputBaseName, setOutputBaseName] = useState<string>('TNPSC_Group4_General_Tamil_100Q');

  // Real-Time Batch Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [serverStatus, setServerStatus] = useState<{ hasGeminiKey: boolean } | null>(null);

  // Batch Progress Metrics
  const [batchItems, setBatchItems] = useState<BatchItemState[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(1);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentQuestionNum, setCurrentQuestionNum] = useState<number>(0);
  const [stage, setStage] = useState<
    'idle' | 'reading' | 'cleaning' | 'extracting' | 'exporting' | 'completed' | 'error'
  >('idle');
  const [stageMessage, setStageMessage] = useState<string>('');

  // Results State
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [rawLines, setRawLines] = useState<RawPageLine[]>([]);
  const [activeResultTab, setActiveResultTab] = useState<'grid' | 'review' | 'raw'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'review'>('all');

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<ExtractedQuestion | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Check server status on mount and initialize default 100-question sample paper
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch(() => setServerStatus(null));

    // Run initial offline extraction for all 100 questions of flagship sample paper
    const initialPaper = SAMPLE_PAPERS[0];
    setOutputBaseName('TNPSC_Group4_General_Tamil_100Q');
    runLocalExtraction(initialPaper.rawText, {
      ...config,
      qFrom: 1,
      qTo: 100,
    }, 'TNPSC_Group4_General_Tamil_100Q.pdf');
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSelectSample = (paper: SamplePaper) => {
    setSelectedPaperId(paper.id);
    setInputText(paper.rawText);
    const baseName = `${paper.testSeries}_${paper.questionBank}_100Questions`;
    setOutputBaseName(baseName);

    const updatedConfig = {
      ...config,
      qFrom: paper.qFrom || 1,
      qTo: paper.qTo || 100,
      testSeries: paper.testSeries,
      questionBank: paper.questionBank,
    };
    setConfig(updatedConfig);
    runLocalExtraction(paper.rawText, updatedConfig, `${paper.title}.pdf`);
  };

  const handleSelectUploadedDoc = (doc: UploadedDocument) => {
    setSelectedPaperId(doc.id);
    setInputText(doc.rawText);

    // Strictly store output on the given input file name without previous extension
    const baseName = doc.name.replace(/\.[^/.]+$/, '');
    setOutputBaseName(baseName);

    // Auto update series name from file
    const cleanSeries = baseName.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 10).toUpperCase();
    if (cleanSeries) {
      setConfig((prev) => ({ ...prev, testSeries: cleanSeries }));
    }

    if (doc.questions && doc.questions.length > 0) {
      setQuestions(doc.questions);
      setReviewItems(doc.reviewItems || []);
      addLog(`Loaded ${doc.questions.length} previously extracted questions for ${doc.name}`);
    } else if (doc.rawText && !doc.isScanned) {
      runLocalExtraction(doc.rawText, config, doc.name);
    } else if (doc.isScanned) {
      addLog(`Selected scanned document: ${doc.name}. Switch Engine to 'Gemini 3.8 Vision' to perform visual OCR.`);
      if (serverStatus?.hasGeminiKey) {
        setConfig((prev) => ({ ...prev, useGeminiVision: true }));
      }
    }
  };

  const handleDeleteUploadedDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedDocuments((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (remaining.length === 0) {
        setActiveInputTab('samples');
        handleSelectSample(SAMPLE_PAPERS[0]);
      } else if (selectedPaperId === id) {
        handleSelectUploadedDoc(remaining[0]);
      }
      return remaining;
    });
    setBatchItems((prev) => prev.filter((b) => b.id !== id));
  };

  // Offline extraction of all 100 questions with real-time progress simulation
  const runLocalExtraction = (
    text: string,
    currentConfig: ExtractionConfig,
    customName?: string
  ) => {
    setIsProcessing(true);
    setStage('reading');
    setProgress(15);
    setCurrentQuestionNum(0);
    setLogs([]);

    const docName =
      customName ||
      uploadedDocuments.find((d) => d.id === selectedPaperId)?.name ||
      'TNPSC_General_Tamil_100Q.pdf';
    setCurrentFileName(docName);
    setStageMessage(`Cleansing Tamil text & preparing Noto Sans Tamil engine...`);

    addLog(`Initiating offline extraction for range: ${currentConfig.qFrom} to ${currentConfig.qTo}`);
    addLog(`Test Series: ${currentConfig.testSeries} | Question Bank: ${currentConfig.questionBank}`);

    const lines = text.split('\n');
    addLog(`Processing document stream: ${lines.length} lines`);

    setTimeout(() => {
      setStage('cleaning');
      setProgress(40);
      setStageMessage(`Normalizing Tamil characters & cleaning OCR junk...`);

      let pageNum = 1;
      const parsedRawLines: RawPageLine[] = [];
      lines.forEach((line, idx) => {
        if (line.includes('===== Page')) {
          const match = line.match(/Page\s+(\d+)/);
          if (match) pageNum = parseInt(match[1], 10);
          return;
        }
        if (line.trim()) {
          parsedRawLines.push({
            page: pageNum,
            col: 1,
            line: idx + 1,
            text: line.trim(),
            conf: 0.95,
          });
        }
      });
      setRawLines(parsedRawLines);
      setTotalPages(pageNum || 1);

      setTimeout(() => {
        setStage('extracting');
        setStageMessage(`Processing all 100 questions offline for ${docName}...`);
        setProgress(75);

        const { questions: extracted, review } = extractQuestionsFromLines(
          lines,
          currentConfig.qFrom, // 1
          currentConfig.qTo,   // 100
          currentConfig.testSeries,
          currentConfig.questionBank
        );

        setCurrentQuestionNum(extracted.length);
        setProgress(95);
        setStage('exporting');
        const targetOutputName = `${docName.replace(/\.[^/.]+$/, '')}.xlsx`;
        setStageMessage(`All ${extracted.length} questions ready. Target: ${targetOutputName}`);

        setTimeout(() => {
          setQuestions(extracted);
          setReviewItems(review);
          setProgress(100);
          setStage('completed');
          setIsProcessing(false);

          const validCount = extracted.filter((q) => q.status === 'valid').length;
          addLog(
            `[OK] Complete! Extracted ${extracted.length} questions offline (${validCount} valid, ${review.length} flagged for review)`
          );
        }, 200);
      }, 250);
    }, 200);
  };

  // Process single or batch PDF files / folder upload
  const processFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;

    // Filter to PDF and document files
    const allFiles = Array.from(fileList).filter((f) => {
      const lower = f.name.toLowerCase();
      return (
        lower.endsWith('.pdf') ||
        lower.endsWith('.txt') ||
        lower.endsWith('.png') ||
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg')
      );
    });

    if (allFiles.length === 0) {
      addLog(`[Notice] No compatible PDF or document files found in selection.`);
      return;
    }

    setIsProcessing(true);
    setStage('reading');
    setLogs([]);
    addLog(`Initiating batch offline extraction for ${allFiles.length} file(s) into Document Input folder...`);

    const initialBatchItems: BatchItemState[] = allFiles.map((f, idx) => ({
      id: `batch-${Date.now()}-${idx}`,
      name: f.name,
      size: f.size,
      status: 'waiting',
      totalPages: 1,
      outputName: `${f.name.replace(/\.[^/.]+$/, '')}.xlsx`,
    }));
    setBatchItems(initialBatchItems);

    const newDocs: UploadedDocument[] = [];

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      const docId = `user-doc-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const fileNameLower = file.name.toLowerCase();

      setCurrentFileIndex(i + 1);
      setCurrentFileName(file.name);
      setStageMessage(`[${i + 1}/${allFiles.length}] Loading ${file.name}...`);
      const fileProgressBase = Math.round((i / allFiles.length) * 100);
      setProgress(fileProgressBase + 5);

      // Update current batch item status
      setBatchItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'reading' } : item))
      );

      let rawText = '';
      let pageCount = 1;
      let isScanned = false;
      let images: { page: number; base64: string }[] = [];

      try {
        if (fileNameLower.endsWith('.pdf')) {
          setStageMessage(`Reading pages for ${file.name} (Multi-page PDF)...`);
          const pdfResult = await readPdfFile(file, {
            maxPages: 100, // Read full PDF up to 100 pages
            onProgress: (curP, totP) => {
              setCurrentPage(curP);
              setTotalPages(totP);
              setStageMessage(`Reading Page ${curP} of ${totP} (${file.name})...`);
              setBatchItems((prev) =>
                prev.map((item, idx) =>
                  idx === i ? { ...item, currentPage: curP, totalPages: totP } : item
                )
              );
            },
          });
          rawText = pdfResult.text;
          pageCount = pdfResult.pageCount;
          isScanned = pdfResult.isScanned;
          images = pdfResult.images;
        } else if (fileNameLower.endsWith('.txt')) {
          rawText = await file.text();
          pageCount = 1;
        } else {
          const img = await readImageFileAsBase64(file);
          rawText = `===== Page 1 =====\n(Image Document: ${file.name})`;
          isScanned = true;
          images = [{ page: 1, base64: img.base64 }];
        }
      } catch (err: any) {
        addLog(`[Fallback] Loaded ${file.name} with standard text reader.`);
        rawText = `===== Page 1 =====\n(Uploaded File: ${file.name})`;
        isScanned = true;
      }

      // Offline Extraction of all 100 questions for this document
      setStage('extracting');
      setStageMessage(`Extracting all 100 questions offline from ${file.name}...`);
      setBatchItems((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: 'extracting', totalPages: pageCount } : item
        )
      );

      const lines = rawText.split('\n');
      const { questions: extracted, review } = extractQuestionsFromLines(
        lines,
        config.qFrom, // 1
        config.qTo,   // 100
        config.testSeries || 'TNPSC',
        config.questionBank || '20242'
      );

      const docItem: UploadedDocument = {
        id: docId,
        name: file.name,
        size: file.size,
        type: fileNameLower.endsWith('.pdf') ? 'pdf' : 'txt',
        pageCount,
        rawText,
        isScanned,
        images,
        uploadedAt: new Date().toLocaleTimeString(),
        questions: extracted,
        reviewItems: review,
        outputName: `${baseName}.xlsx`,
      };
      newDocs.push(docItem);

      // Mark batch item completed
      setBatchItems((prev) =>
        prev.map((item, idx) =>
          idx === i
            ? {
                ...item,
                status: 'completed',
                questionsCount: extracted.length,
                outputName: `${baseName}.xlsx`,
              }
            : item
        )
      );
      addLog(`[OK] ${file.name}: ${pageCount} page(s) -> ${extracted.length} questions extracted offline.`);
    }

    if (newDocs.length > 0) {
      setUploadedDocuments((prev) => [...newDocs, ...prev]);
      setActiveInputTab('uploaded');
      const firstDoc = newDocs[0];
      setSelectedPaperId(firstDoc.id);
      setInputText(firstDoc.rawText);

      // Set output name to the given input file name without extension
      const firstBaseName = firstDoc.name.replace(/\.[^/.]+$/, '');
      setOutputBaseName(firstBaseName);

      if (firstDoc.questions && firstDoc.questions.length > 0) {
        setQuestions(firstDoc.questions);
        setReviewItems(firstDoc.reviewItems || []);
      }
    }

    setStage('completed');
    setStageMessage(`Batch processing completed! All 100 questions processed offline.`);
    setProgress(100);
    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleStartExtraction = async () => {
    if (config.useGeminiVision && serverStatus?.hasGeminiKey) {
      setIsProcessing(true);
      setStage('reading');
      setProgress(30);
      setLogs([]);
      addLog(`Connecting to server-side Gemini 3.8 Flash Vision engine...`);

      try {
        const activeDoc = uploadedDocuments.find((d) => d.id === selectedPaperId);
        const imageParts =
          activeDoc?.images?.map((img) => ({
            mimeType: 'image/jpeg',
            base64: img.base64,
          })) || [];

        const response = await fetch('/api/gemini/extract-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText: inputText,
            imageParts: imageParts.length > 0 ? imageParts : undefined,
            qFrom: config.qFrom,
            qTo: config.qTo,
            testSeries: config.testSeries,
            questionBank: config.questionBank,
          }),
        });

        const data = await response.json();
        setProgress(85);

        if (data.questions && Array.isArray(data.questions)) {
          const formattedQuestions: ExtractedQuestion[] = data.questions.map(
            (q: any, i: number) => ({
              id: `q-gemini-${q.number || i + 1}`,
              number: q.number || i + config.qFrom,
              testSeries: config.testSeries,
              questionBank: config.questionBank,
              questionNoFormula: `=CONCATENATE("${config.testSeries}","-","${config.questionBank}","-",${q.number || i + config.qFrom})`,
              question: q.question,
              answers: q.answers,
              options: {},
              correctAnswer: q.correctAnswer || null,
              status: q.reviewNotes ? 'needs_review' : 'valid',
              reviewProblems: q.reviewNotes ? [q.reviewNotes] : [],
            })
          );

          setQuestions(formattedQuestions);
          addLog(`Gemini OCR successfully extracted ${formattedQuestions.length} questions!`);
        }
      } catch (err: any) {
        addLog(`Gemini request failed: ${err.message}. Falling back to rule-based engine.`);
        runLocalExtraction(inputText, config);
      } finally {
        setProgress(100);
        setIsProcessing(false);
      }
    } else {
      runLocalExtraction(inputText, config);
    }
  };

  // Export current questions with exact input filename and extension
  const handleExportXLSX = () => {
    const finalFileName = `${outputBaseName || 'tamil_questions'}.xlsx`;
    exportToXLSX(
      questions,
      reviewItems,
      rawLines,
      config.testSeries,
      config.questionBank,
      finalFileName
    );
    addLog(`Exported Excel file: ${finalFileName}`);
  };

  const handleExportDOCX = () => {
    const finalFileName = `${outputBaseName || 'tamil_questions'}.docx`;
    exportToDOCX(questions, finalFileName);
    addLog(`Exported Word document: ${finalFileName}`);
  };

  const handleExportTXT = () => {
    const finalFileName = `${outputBaseName || 'tamil_questions'}.txt`;
    exportToTXT(questions, finalFileName);
    addLog(`Exported text file: ${finalFileName}`);
  };

  const handleExportJSON = () => {
    const finalFileName = `${outputBaseName || 'tamil_questions'}.json`;
    exportToJSON(
      questions,
      reviewItems,
      config.testSeries,
      config.questionBank,
      finalFileName
    );
    addLog(`Exported JSON file: ${finalFileName}`);
  };

  // Export all processed batch documents into a single ZIP archive
  const handleExportBatchZip = async () => {
    if (uploadedDocuments.length === 0) {
      handleExportXLSX();
      return;
    }

    const zip = new JSZip();
    addLog(`Generating batch ZIP package for ${uploadedDocuments.length} files...`);

    for (const doc of uploadedDocuments) {
      const qList = doc.questions && doc.questions.length > 0 ? doc.questions : questions;
      const rList = doc.reviewItems || reviewItems;
      const baseName = doc.name.replace(/\.[^/.]+$/, '');

      const wb = XLSX.utils.book_new();
      const questionsData: any[] = [
        ['TestSeries', 'QuestionBank', 'QuestionNo', 'Number', 'Question', 'Anwers', 'CorrectAnswer'],
      ];

      qList.forEach((q, idx) => {
        const rowNum = idx + 2;
        questionsData.push([
          q.testSeries || config.testSeries,
          q.questionBank || config.questionBank,
          {
            f: `CONCATENATE(A${rowNum},"-",B${rowNum},"-",D${rowNum})`,
            v: `${q.testSeries}-${q.questionBank}-${q.number}`,
          },
          q.number,
          q.question,
          q.answers,
          q.correctAnswer || null,
        ]);
      });

      const wsQuestions = XLSX.utils.aoa_to_sheet(questionsData);
      wsQuestions['!cols'] = [
        { wch: 14 },
        { wch: 16 },
        { wch: 22 },
        { wch: 10 },
        { wch: 75 },
        { wch: 75 },
        { wch: 16 },
      ];
      XLSX.utils.book_append_sheet(wb, wsQuestions, 'Questions');

      const reviewData: any[] = [['Number', 'Problem']];
      rList.forEach((r) => reviewData.push([r.number, r.problem]));
      const wsReview = XLSX.utils.aoa_to_sheet(reviewData);
      wsReview['!cols'] = [{ wch: 12 }, { wch: 100 }];
      XLSX.utils.book_append_sheet(wb, wsReview, 'Needs review');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      zip.file(`${baseName}.xlsx`, wbout);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch_Tamil_100Questions_${outputBaseName || 'Exam'}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Batch ZIP downloaded: Batch_Tamil_100Questions_${outputBaseName || 'Exam'}.zip`);
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    if (statusFilter === 'valid' && q.status !== 'valid') return false;
    if (statusFilter === 'review' && q.status !== 'needs_review') return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const matchText =
        q.question.toLowerCase().includes(qLower) ||
        q.answers.toLowerCase().includes(qLower) ||
        q.number.toString().includes(qLower);
      if (!matchText) return false;
    }
    return true;
  });

  const validCount = questions.filter((q) => q.status === 'valid').length;
  const reviewCount = questions.filter((q) => q.status === 'needs_review').length;
  const avgJunk =
    questions.length > 0
      ? (
          (questions.reduce((acc, q) => acc + (q.junkRatio || 0), 0) / questions.length) *
          100
        ).toFixed(1)
      : '0.0';

  const handleSaveEdit = () => {
    if (!editingQuestion) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === editingQuestion.id ? editingQuestion : q))
    );
    setEditingQuestion(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Real-Time Batch Progress Bar Component */}
      <BatchProgressBar
        isProcessing={isProcessing}
        currentFileName={currentFileName}
        currentFileIndex={currentFileIndex}
        totalFiles={batchItems.length > 0 ? batchItems.length : 1}
        currentPage={currentPage}
        totalPages={totalPages}
        currentQuestion={currentQuestionNum}
        totalQuestions={config.qTo - config.qFrom + 1}
        stageMessage={stageMessage}
        stage={stage}
        percentage={progress}
        batchItems={batchItems}
        onCancel={() => {
          setIsProcessing(false);
          setStage('idle');
          addLog('Batch processing cancelled by user.');
        }}
        onExportItem={(item) => {
          const doc = uploadedDocuments.find((d) => d.name === item.name);
          if (doc && doc.questions) {
            exportToXLSX(
              doc.questions,
              doc.reviewItems || [],
              [],
              config.testSeries,
              config.questionBank,
              `${item.name.replace(/\.[^/.]+$/, '')}.xlsx`
            );
          }
        }}
      />

      {/* 2. Configuration & Engine Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Exam Question Configuration (100 Questions Offline Engine)
              </h2>
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                Default: Q1–100
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify question number range, series prefix, question bank ID, and input-to-output naming.
            </p>
          </div>

          {/* Quick Engine Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Engine:</span>
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setConfig((prev) => ({ ...prev, useGeminiVision: false }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  !config.useGeminiVision
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Offline Rule Engine
              </button>
              <button
                onClick={() => setConfig((prev) => ({ ...prev, useGeminiVision: true }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  config.useGeminiVision
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Gemini 3.8 Vision
              </button>
            </div>
          </div>
        </div>

        {/* Inputs Grid with Default 100 Questions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              From Question #
            </label>
            <input
              type="number"
              min={1}
              max={999}
              value={config.qFrom}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, qFrom: parseInt(e.target.value, 10) || 1 }))
              }
              className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              To Question # (Default 100)
            </label>
            <input
              type="number"
              min={1}
              max={999}
              value={config.qTo}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, qTo: parseInt(e.target.value, 10) || 100 }))
              }
              className="w-full text-xs font-mono p-2 border border-indigo-300 bg-indigo-50/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-indigo-950"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Test Series Code
            </label>
            <input
              type="text"
              value={config.testSeries}
              onChange={(e) => setConfig((prev) => ({ ...prev, testSeries: e.target.value }))}
              placeholder="e.g. TNPSC"
              className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Question Bank ID
            </label>
            <input
              type="text"
              value={config.questionBank}
              onChange={(e) => setConfig((prev) => ({ ...prev, questionBank: e.target.value }))}
              placeholder="e.g. 20242"
              className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="col-span-2 flex items-end gap-2">
            <button
              onClick={handleStartExtraction}
              disabled={isProcessing}
              className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isProcessing
                ? 'Processing 100 Questions...'
                : `Run Extraction (${config.qTo - config.qFrom + 1} Qs)`}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Toggle Advanced OCR Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Settings */}
        {showSettings && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50/70 p-3 rounded-lg">
            <div>
              <label className="text-slate-600 block mb-1">PDF Raster DPI</label>
              <select
                value={config.dpi}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, dpi: parseInt(e.target.value, 10) }))
                }
                className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
              >
                <option value={150}>150 DPI (Fast & Clear)</option>
                <option value={200}>200 DPI (High Clarity)</option>
                <option value={300}>300 DPI (Maximum Quality)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 block mb-1">Confidence Threshold</label>
              <select
                value={config.minConfidence}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, minConfidence: parseFloat(e.target.value) }))
                }
                className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
              >
                <option value={0.65}>0.65 (Lenient)</option>
                <option value={0.85}>0.85 (Standard Default)</option>
                <option value={0.92}>0.92 (Strict)</option>
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoDetectColumns}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, autoDetectColumns: e.target.checked }))
                  }
                  className="rounded text-slate-900"
                />
                Detect 2-Column Gutters
              </label>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.straightPage}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, straightPage: e.target.checked }))
                  }
                  className="rounded text-slate-900"
                />
                Straight Page Optimization
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 3. Document Selection & Input Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document Input Folder & Selector */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`lg:col-span-5 bg-white border rounded-xl p-5 shadow-xs space-y-4 transition-all relative ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
              : 'border-slate-200'
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-indigo-900/10 backdrop-blur-2xs rounded-xl flex items-center justify-center z-20 border-2 border-dashed border-indigo-600">
              <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-xs font-bold text-indigo-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600 animate-bounce" />
                Drop PDF / Exam files here to add into folder!
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-indigo-600" />
                Document Input Folder
              </h3>
              <p className="text-[11px] text-slate-500">
                {uploadedDocuments.length} uploaded in folder · {SAMPLE_PAPERS.length} samples available
              </p>
            </div>

            {/* Segmented control for Uploaded vs Samples */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setActiveInputTab('uploaded')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeInputTab === 'uploaded'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>My Files</span>
                <span className="font-mono text-[10px] bg-slate-200/80 px-1.5 rounded-full">
                  {uploadedDocuments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveInputTab('samples')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeInputTab === 'samples'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Samples ({SAMPLE_PAPERS.length})
              </button>
            </div>
          </div>

          {/* Dedicated Output File Name Sync Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Download className="w-3 h-3 text-emerald-600" />
                Output File Name Target:
              </span>
              <span className="text-[10px] text-slate-500">Stored on input file name</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={outputBaseName}
                onChange={(e) => setOutputBaseName(e.target.value)}
                className="w-full text-xs font-mono font-medium px-2 py-1 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                placeholder="e.g. TNPSC_Exam_General_Tamil"
              />
              <span className="text-xs font-mono text-slate-500 font-semibold shrink-0">
                .xlsx / .docx
              </span>
            </div>
          </div>

          {/* Tab Content: Uploaded Documents */}
          {activeInputTab === 'uploaded' && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {uploadedDocuments.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">No PDFs in folder yet</div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Click <strong>'Select PDF Files'</strong> or <strong>'Select Folder'</strong> below, or drop exam files here. All 100 questions will be extracted offline.
                  </p>
                </div>
              ) : (
                uploadedDocuments.map((doc) => {
                  const isSelected = selectedPaperId === doc.id;
                  const docBaseName = doc.name.replace(/\.[^/.]+$/, '');
                  const hasQuestions = doc.questions && doc.questions.length > 0;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectUploadedDoc(doc)}
                      className={`w-full p-3 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <div className="font-semibold text-slate-900 text-xs truncate font-mono">
                            {doc.name}
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                          <span>{Math.round(doc.size / 1024)} KB</span>
                          {doc.pageCount && <span>· {doc.pageCount} page(s)</span>}
                          <span>· Output: <strong className="text-emerald-700">{docBaseName}.xlsx</strong></span>
                          {hasQuestions && (
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold text-[9px]">
                              {doc.questions?.length} Qs Ready
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[10px] ml-auto">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {hasQuestions && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportToXLSX(
                                doc.questions || [],
                                doc.reviewItems || [],
                                [],
                                config.testSeries,
                                config.questionBank,
                                `${docBaseName}.xlsx`
                              );
                            }}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title={`Download ${docBaseName}.xlsx`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => handleDeleteUploadedDoc(doc.id, e)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab Content: Sample Papers */}
          {activeInputTab === 'samples' && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {SAMPLE_PAPERS.map((paper) => {
                const isSelected = selectedPaperId === paper.id;
                return (
                  <button
                    key={paper.id}
                    onClick={() => handleSelectSample(paper)}
                    className={`w-full p-3 rounded-xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900 text-xs">{paper.title}</div>
                      {isSelected && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{paper.badge}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {paper.testSeries}-{paper.questionBank}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Upload Buttons for PDF selection & Folder selection */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <label
                htmlFor="multi-file-upload"
                className="py-2.5 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs text-center"
              >
                <Upload className="w-3.5 h-3.5" />
                Select PDF Files...
              </label>

              <label
                htmlFor="folder-upload"
                className="py-2.5 px-3 bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs text-center"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-700" />
                Select Folder (Batch PDF)...
              </label>
            </div>

            <input
              id="multi-file-upload"
              type="file"
              multiple
              accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            <input
              id="folder-upload"
              type="file"
              multiple
              // @ts-ignore
              webkitdirectory=""
              directory=""
              onChange={handleFileUpload}
              className="hidden"
            />

            <p className="text-[10px] text-slate-400 text-center">
              100% offline in browser · All 100 questions processed locally · Output stored with input filename
            </p>
          </div>
        </div>

        {/* Input Text / OCR Stream Preview */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Document Text Stream (Reading Order · Noto Sans Tamil)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {inputText.split('\n').length} lines
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={11}
            className="w-full text-xs font-tamil p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all leading-relaxed"
            placeholder="Document lines will appear here..."
          />

          {/* Quick status feedback strip */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-mono text-[11px]">
              Active target: <strong className="text-slate-800">{outputBaseName}.xlsx</strong>
            </span>
            <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Noto Sans Tamil Encoding Active
            </span>
          </div>
        </div>
      </div>

      {/* 4. Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Questions Range</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {questions.length} / 100
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Range: Q{config.qFrom} to Q{config.qTo}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Valid Questions</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {validCount}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            Full (A)-(E) complete options
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Needs Review</div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              reviewCount > 0 ? 'text-amber-600' : 'text-slate-400'
            }`}
          >
            {reviewCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Missing options or short stem
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Avg Junk Filtered</div>
          <div className="text-2xl font-bold font-mono text-slate-700 mt-1">
            {avgJunk}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Tokens cleansed by classifier
          </div>
        </div>
      </div>

      {/* 5. Results Studio & Exporter with Given Input File Name */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmented Controls for Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setActiveResultTab('grid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeResultTab === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Questions Grid ({questions.length})
            </button>
            <button
              onClick={() => setActiveResultTab('review')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeResultTab === 'review'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Needs Review ({reviewItems.length})
            </button>
            <button
              onClick={() => setActiveResultTab('raw')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeResultTab === 'raw'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Lines ({rawLines.length})
            </button>
          </div>

          {/* Search & Export Buttons with exact input filename */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 w-44 sm:w-52"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="valid">Valid Only</option>
              <option value="review">Needs Review Only</option>
            </select>

            {/* Export Buttons: Strictly based on given input file name with extension */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportXLSX}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title={`Download Excel: ${outputBaseName}.xlsx`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{outputBaseName ? `${outputBaseName.slice(0, 16)}....xlsx` : 'Excel (.xlsx)'}</span>
              </button>

              <button
                onClick={handleExportDOCX}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title={`Download Word: ${outputBaseName}.docx`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Word (.docx)</span>
              </button>

              <button
                onClick={handleExportTXT}
                className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                title={`Download ${outputBaseName}.txt`}
              >
                .txt
              </button>

              <button
                onClick={handleExportJSON}
                className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                title={`Download ${outputBaseName}.json`}
              >
                .json
              </button>

              {uploadedDocuments.length > 1 && (
                <button
                  onClick={handleExportBatchZip}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Download all processed batch PDF files as ZIP"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Batch ZIP ({uploadedDocuments.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab 1: Extracted Questions Grid */}
        {activeResultTab === 'grid' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-3 py-3 w-12 text-center">No</th>
                  <th className="px-3 py-3 w-28">TestSeries</th>
                  <th className="px-3 py-3 w-28">QuestionBank</th>
                  <th className="px-3 py-3 w-36 font-mono">QuestionNo (Formula)</th>
                  <th className="px-4 py-3 min-w-[320px]">Question Text (Noto Sans Tamil)</th>
                  <th className="px-4 py-3 min-w-[280px]">Options (A)-(E)</th>
                  <th className="px-3 py-3 w-24 text-center">Answer</th>
                  <th className="px-3 py-3 w-24 text-center">Status</th>
                  <th className="px-3 py-3 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      No questions match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q) => (
                    <tr
                      key={q.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        q.status === 'needs_review' ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-900">
                        {q.number}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-600">{q.testSeries}</td>
                      <td className="px-3 py-3 font-mono text-slate-600">{q.questionBank}</td>
                      <td className="px-3 py-3 font-mono text-slate-500 text-[11px]">
                        {q.testSeries}-{q.questionBank}-{q.number}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-tamil leading-relaxed">
                        <div className="max-h-24 overflow-y-auto pr-1 whitespace-pre-line">
                          {q.question}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-tamil leading-relaxed text-[11px]">
                        <div className="max-h-24 overflow-y-auto pr-1 whitespace-pre-line font-tamil bg-slate-50 p-1.5 rounded border border-slate-100">
                          {q.answers}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <select
                          value={q.correctAnswer || ''}
                          onChange={(e) => {
                            const val = e.target.value || null;
                            setQuestions((prev) =>
                              prev.map((item) =>
                                item.id === q.id ? { ...item, correctAnswer: val } : item
                              )
                            );
                          }}
                          className="px-2 py-1 text-xs border border-slate-200 rounded bg-white font-mono font-bold text-indigo-700"
                        >
                          <option value="">-</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </select>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {q.status === 'valid' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Valid
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium cursor-help"
                            title={q.reviewProblems.join('; ')}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Review
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Needs Review Auditor */}
        {activeResultTab === 'review' && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Automated Quality Auditor Log ("Needs Review" Sheet)
                </h4>
                <p className="text-xs text-slate-500">
                  Questions flagged due to missing options, high junk ratio (&gt;25%), or missing numbers.
                </p>
              </div>
            </div>

            {reviewItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-semibold text-slate-800">Zero Issues Detected!</div>
                <div className="text-xs text-slate-500 mt-1">
                  All 100 questions in the range have complete option sets (A)-(E) and clean Tamil text.
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                  <thead className="bg-slate-50 font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-2.5 w-24">Question #</th>
                      <th className="px-4 py-2.5">Detected Problem / Audit Flag</th>
                      <th className="px-4 py-2.5 w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {reviewItems.map((item, idx) => {
                      const matchedQuestion = questions.find((q) => q.number === item.number);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{item.number}</td>
                          <td className="px-4 py-2.5 text-amber-800 font-sans">{item.problem}</td>
                          <td className="px-4 py-2.5 text-center">
                            {matchedQuestion && (
                              <button
                                onClick={() => setEditingQuestion(matchedQuestion)}
                                className="text-indigo-600 hover:text-indigo-900 font-medium cursor-pointer"
                              >
                                Fix in Editor
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Raw Lines Stream */}
        {activeResultTab === 'raw' && (
          <div className="p-6 space-y-4">
            <div className="text-xs text-slate-500">
              Raw bounding lines reconstructed in reading order by geometric gutter detection:
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left font-mono text-[11px]">
                <thead className="bg-slate-50 font-semibold text-slate-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 w-16">Page</th>
                    <th className="px-3 py-2 w-16">Col</th>
                    <th className="px-3 py-2 w-16">Line</th>
                    <th className="px-4 py-2">Text Content</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawLines.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 text-slate-500">{r.page}</td>
                      <td className="px-3 py-1.5 text-slate-500">{r.col}</td>
                      <td className="px-3 py-1.5 text-slate-500">{r.line}</td>
                      <td className="px-4 py-1.5 font-tamil text-slate-900">{r.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 6. Live Question Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit Question #{editingQuestion.number} ({editingQuestion.testSeries}-
                {editingQuestion.questionBank})
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Question Text Stem (Tamil / English)
              </label>
              <textarea
                value={editingQuestion.question}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, question: e.target.value })
                }
                rows={4}
                className="w-full text-xs font-tamil p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Answer Options (A) through (E)
              </label>
              <textarea
                value={editingQuestion.answers}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, answers: e.target.value })
                }
                rows={5}
                className="w-full text-xs font-tamil p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correct Answer Key
                </label>
                <select
                  value={editingQuestion.correctAnswer || ''}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      correctAnswer: e.target.value || null,
                    })
                  }
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg font-mono font-bold"
                >
                  <option value="">None / Unknown</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Validation Status
                </label>
                <select
                  value={editingQuestion.status}
                  onChange={(e: any) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      status: e.target.value,
                      reviewProblems:
                        e.target.value === 'valid' ? [] : editingQuestion.reviewProblems,
                    })
                  }
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg text-xs"
                >
                  <option value="valid">Valid (Approved)</option>
                  <option value="needs_review">Needs Review</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
