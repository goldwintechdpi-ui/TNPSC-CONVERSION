export interface ExtractedQuestion {
  id: string;
  number: number;
  testSeries: string;
  questionBank: string;
  questionNoFormula?: string;
  question: string;
  answers: string;
  options: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    E?: string;
  };
  correctAnswer?: string | null;
  junkRatio?: number;
  status: 'valid' | 'needs_review';
  reviewProblems: string[];
  rawLines?: string[];
  pageNumber?: number;
}

export interface ReviewItem {
  number: number;
  problem: string;
}

export interface RawPageLine {
  page: number;
  col: number;
  line: number;
  text: string;
  conf?: number;
}

export interface ExtractionConfig {
  qFrom: number;
  qTo: number;
  testSeries: string;
  questionBank: string;
  autoDetectColumns: boolean;
  minConfidence: number;
  batchSize: number;
  pagesPerBatch: number;
  dpi: number;
  straightPage: boolean;
  extractQuestionsMode: boolean;
  useGeminiVision: boolean;
}

export interface BatchFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  pageCount: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  questionsCount: number;
  reviewCount: number;
  extractedQuestions: ExtractedQuestion[];
  rawLines: RawPageLine[];
  reviewItems: ReviewItem[];
  error?: string;
  previewUrl?: string;
  file?: File;
}
