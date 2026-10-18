import {
  cleanLine,
  normalize,
  tidyText,
  E_CANON,
} from './tamilCleaner';
import { ExtractedQuestion, ReviewItem } from './types';

// Flexible question header regex supporting standard 1., 1), (1), 1 -, வினா 1, கேள்வி 1, Q1, etc.
const Q_HEAD = /^\s*(?:(?:வினா|கேள்வி|Q(?:uestion)?\.?)\s*)?(?:\(?\s*(\d{1,3})\s*(?:\)|\.|-|:|\/)\s*|\b(\d{1,3})\s*[.):\-]\s+)(.*)$/i;

// Match both English (A)-(E) and Tamil (அ)-(உ) as well as A. or அ. options
const OPT_MARK = /(?:(?<=\s)|^)(?:\(\s*([A-Ea-e])\s*\)|\(\s*([அஆஇஈஉ])\s*\)|([A-Ea-e])\s*[.):]\s+|([அஆஇஈஉ])\s*[.):]\s+)/g;
const HDR_ABCD = /^\s*(?:\(\s*[aA]\s*\)\s*\(\s*[bB]\s*\)\s*\(\s*[cC]\s*\)\s*\(\s*[dD]\s*\)|\(\s*அ\s*\)\s*\(\s*ஆ\s*\)\s*\(\s*இ\s*\)\s*\(\s*ஈ\s*\))\s*$/i;
const MAX_LINES_PER_QUESTION = 60;

// Tamil to English option mapping
const TAMIL_OPT_MAP: Record<string, string> = {
  'அ': 'A',
  'ஆ': 'B',
  'இ': 'C',
  'ஈ': 'D',
  'உ': 'E',
};

interface RawQuestionDict {
  n: number;
  text: string[];
  opts: Record<string, string[]>;
  hdr: boolean;
  nlines: number;
  last: string | null;
}

function newRawQuestion(n: number): RawQuestionDict {
  return {
    n,
    text: [],
    opts: {},
    hdr: false,
    nlines: 0,
    last: null,
  };
}

function addText(q: RawQuestionDict, text: string) {
  if (q.last === '_dup') return;
  if (q.last && q.opts[q.last]) {
    q.opts[q.last].push(text);
  } else {
    q.text.push(text);
  }
}

export function parseRawQuestions(
  lines: string[],
  lo = 1,
  hi = 100
): Record<number, RawQuestionDict> {
  const found: Record<number, RawQuestionDict> = {};
  let cur: RawQuestionDict | null = null;

  const optionsSeen = (q: RawQuestionDict): boolean => {
    return Object.keys(q.opts).length >= 2 || 'E' in q.opts || 'e' in q.opts;
  };

  for (const raw of lines) {
    let line = normalize(raw).trim();
    if (!line) continue;

    // Skip page boundary markers
    if (line.startsWith('===== Page') || line.startsWith('Page ') || /^-{3,}$/.test(line)) {
      continue;
    }

    const match = line.match(Q_HEAD);
    if (match) {
      const numStr = match[1] || match[2];
      const n = parseInt(numStr, 10);
      const rest = (match[3] || '').trim();
      let start = false;

      if (cur === null) {
        start = n >= lo && n <= hi;
      } else if (n > cur.n && n <= cur.n + 15) {
        if (optionsSeen(cur)) {
          start = true;
        } else if (n === cur.n + 1 && cur.nlines >= 2) {
          start = true;
        } else if (n > cur.n) {
          // If previous question has at least some content
          start = cur.text.length > 0 || optionsSeen(cur);
        }
      } else if (!found[n] && n >= lo && n <= hi) {
        start = true;
      }

      if (start) {
        cur = newRawQuestion(n);
        if (n >= lo && n <= hi) {
          found[n] = cur;
        }
        line = rest;
        if (!line) continue;
      }
    }

    if (cur === null) continue;

    cur.nlines++;
    if (cur.nlines > MAX_LINES_PER_QUESTION) continue;

    if (HDR_ABCD.test(line) && Object.keys(cur.opts).length === 0) {
      cur.hdr = true;
      continue;
    }

    const marks = [...line.matchAll(OPT_MARK)];
    if (marks.length === 0) {
      addText(cur, line);
      continue;
    }

    // There is preceding question text before the first option mark
    const firstIndex = marks[0].index ?? 0;
    const pre = line.slice(0, firstIndex).trim();
    if (pre) {
      addText(cur, pre);
    }

    for (let k = 0; k < marks.length; k++) {
      const mk = marks[k];
      const rawLabel = (mk[1] || mk[2] || mk[3] || mk[4] || '').trim();
      const label = TAMIL_OPT_MAP[rawLabel] || rawLabel.toUpperCase();
      const markStart = mk.index ?? 0;
      const markEnd = markStart + mk[0].length;
      const nextIndex = k + 1 < marks.length ? marks[k + 1].index ?? line.length : line.length;
      const body = line.slice(markEnd, nextIndex).trim();

      if (cur.opts[label]) {
        cur.last = '_dup';
      } else {
        cur.opts[label] = body ? [body] : [];
        cur.last = label;
      }
    }
  }

  return found;
}

export function finalizeQuestion(
  q: RawQuestionDict,
  testSeries: string,
  questionBank: string
): {
  questionText: string;
  answersText: string;
  options: Record<string, string>;
  labels: Set<string>;
  junkRatio: number;
  problems: string[];
} {
  let total = 0;
  let removed = 0;
  const qlines: string[] = [];

  for (const ln of q.text) {
    const { cleanText, tokensIn, tokensRemoved } = cleanLine(ln, false);
    total += tokensIn;
    removed += tokensRemoved;
    if (cleanText) {
      qlines.push(cleanText);
    }
  }

  const questionText = tidyText(qlines.join('\n')).replace(/ \n/g, '\n');

  const outLines: string[] = [];
  if (q.hdr) {
    outLines.push('(a) (b) (c) (d)');
  }

  const optionsObj: Record<string, string> = {};
  for (const label of ['A', 'B', 'C', 'D', 'E']) {
    if (!q.opts[label]) continue;
    const body = q.opts[label].filter(Boolean).join(' ');
    const { cleanText, tokensIn, tokensRemoved } = cleanLine(body, true);
    total += tokensIn;
    removed += tokensRemoved;
    let finalClean = tidyText(cleanText);

    // Standardize Option E if it's the TNPSC "Answer not known" (விடை தெரியவில்லை)
    if (label === 'E') {
      if (!finalClean || finalClean.includes('தெரிய') || finalClean.length < 5) {
        finalClean = E_CANON;
      }
    }
    optionsObj[label] = finalClean;
    outLines.push(`(${label}) ${finalClean}`);
  }

  const junkRatio = total > 0 ? removed / total : 0;
  const labels = new Set(Object.keys(q.opts));
  const problems: string[] = [];

  if (questionText.length < 6) {
    problems.push('Question text missing or too short');
  } else if (junkRatio >= 0.35) {
    problems.push('High junk ratio (>35%) - verify OCR wording');
  }

  const missingOptions = ['A', 'B', 'C', 'D'].filter((x) => !labels.has(x));
  if (missingOptions.length > 0) {
    problems.push(`Options missing: ${missingOptions.join(', ')}`);
  }

  return {
    questionText,
    answersText: outLines.join('\n'),
    options: optionsObj,
    labels,
    junkRatio,
    problems,
  };
}

export function extractQuestionsFromLines(
  lines: string[],
  lo = 1,
  hi = 100,
  testSeries = 'TNPSC',
  questionBank = '20242'
): {
  questions: ExtractedQuestion[];
  review: ReviewItem[];
} {
  const found = parseRawQuestions(lines, lo, hi);
  const questions: ExtractedQuestion[] = [];
  const review: ReviewItem[] = [];

  for (let n = lo; n <= hi; n++) {
    if (!found[n]) {
      // Create guaranteed row for all 100 questions offline, flagged for review
      review.push({
        number: n,
        problem: 'Question number not found in document text',
      });
      questions.push({
        id: `q-${n}-${Date.now()}-${n}`,
        number: n,
        testSeries,
        questionBank,
        questionNoFormula: `=CONCATENATE("${testSeries}","-","${questionBank}","-",${n})`,
        question: `[வினா எண் ${n} ஆவணத்தில் நேரடியாகக் கண்டறியப்படவில்லை / Question ${n} not detected in text]`,
        answers: '(A) \n(B) \n(C) \n(D) \n(E) ' + E_CANON,
        options: {
          A: '',
          B: '',
          C: '',
          D: '',
          E: E_CANON,
        },
        correctAnswer: null,
        junkRatio: 0,
        status: 'needs_review',
        reviewProblems: ['Question number not found in document text'],
        rawLines: [],
      });
      continue;
    }

    const {
      questionText,
      answersText,
      options,
      junkRatio,
      problems,
    } = finalizeQuestion(found[n], testSeries, questionBank);

    const isProblematic = problems.length > 0;
    if (isProblematic) {
      review.push({
        number: n,
        problem: problems.join('; '),
      });
    }

    questions.push({
      id: `q-${n}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      number: n,
      testSeries,
      questionBank,
      questionNoFormula: `=CONCATENATE("${testSeries}","-","${questionBank}","-",${n})`,
      question: questionText || `[வினா எண் ${n} உரை காலியாக உள்ளது]`,
      answers: answersText || '(A) \n(B) \n(C) \n(D) \n(E) ' + E_CANON,
      options: options as any,
      correctAnswer: null,
      junkRatio,
      status: isProblematic ? 'needs_review' : 'valid',
      reviewProblems: problems,
      rawLines: found[n].text,
    });
  }

  return { questions, review };
}
