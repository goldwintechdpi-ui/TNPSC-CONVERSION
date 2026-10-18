/**
 * Tamil & English Text Normalization and Heuristic Cleaning Engine
 * Faithfully mirrors and enhances the junk filtering algorithms from tamil_pdf_tool.py
 */

export const TAMIL_CHAR_RANGE = '\u0B80-\u0BFF';
export const E_CANON = 'விடை தெரியவில்லை';

// Invisible and bidirectional control characters
const INVISIBLE_RE = /[\u200B-\u200F\u202A-\u202E\u2060\uFEFF\u00AD]/g;
const CONTROL_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
const BAD_CHARS_RE = new RegExp(`[^${TAMIL_CHAR_RANGE}A-Za-z0-9\\s.,;:!?'"‘’“”()\\[\\]\\-–—/…=+]`, 'g');

const TAMIL_RE = new RegExp(`[${TAMIL_CHAR_RANGE}]`);
const TAMIL_ALL_RE = new RegExp(`[${TAMIL_CHAR_RANGE}]`, 'g');
const LATIN_RE = /[A-Za-z]/;
const LATIN_ALL_RE = /[A-Za-z]/g;
const CORE_RE = new RegExp(`^[^${TAMIL_CHAR_RANGE}A-Za-z0-9]+|[^${TAMIL_CHAR_RANGE}A-Za-z0-9]+$`, 'g');
const ELLIPSIS_RE = /^[.…]{3,}$/;
const LABEL_TOKEN_RE = /^[\(\[][A-Ea-eRr][\)\]][.,:;]?$/;
const PUNCT_KEEP = new Set([':', ';', '-', '–', '—', '=', '?', "'"]);

// Common English words for fast heuristic lookup without huge dictionary
const COMMON_ENGLISH = new Set([
  'the', 'of', 'and', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his',
  'they', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were',
  'we', 'when', 'your', 'can', 'said', 'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if',
  'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make',
  'like', 'him', 'into', 'time', 'has', 'look', 'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could',
  'people', 'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find', 'long', 'down', 'day',
  'did', 'get', 'come', 'made', 'may', 'part', 'which', 'among', 'following', 'correct', 'statement', 'match', 'list',
  'choose', 'group', 'option', 'true', 'false', 'above', 'below', 'none', 'both', 'article', 'act', 'year', 'century',
  'district', 'river', 'temple', 'ruler', 'dynasty', 'constitution', 'commission', 'high', 'court', 'assembly'
]);

export function isEnglishWord(w: string): boolean {
  const lower = w.toLowerCase();
  if (COMMON_ENGLISH.has(lower)) return true;
  if (lower.length < 3 || !/^[a-z]+$/.test(lower)) return false;

  // Vowel ratio check
  const vowels = (lower.match(/[aeiouy]/g) || []).length;
  const ratio = vowels / lower.length;
  if (ratio < 0.28 || ratio > 0.65) return false;

  // Long consonant runs (≥4 consecutive consonants)
  if (/[^aeiouy]{4,}/.test(lower)) return false;

  // Tripled identical character (e.g. "aaa")
  if (/(.)\1\1/.test(lower)) return false;

  return true;
}

export function normalize(text: string): string {
  if (!text) return '';
  let str = text.normalize('NFC');
  str = str.replace(INVISIBLE_RE, '');
  str = str.replace(CONTROL_RE, '');
  str = str.replace(/\u00A0/g, ' ').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  str = str.replace(BAD_CHARS_RE, ' ');
  return str;
}

export type TokenKind = 'G' | 'N' | 'T' | 'P' | 'J';

export interface ClassifiedToken {
  token: string;
  kind: TokenKind;
  cleaned: string;
}

export function classify(tok: string, answerMode = false): ClassifiedToken {
  if (ELLIPSIS_RE.test(tok)) {
    return { token: tok, kind: 'G', cleaned: tok };
  }
  if (LABEL_TOKEN_RE.test(tok)) {
    return { token: tok, kind: 'G', cleaned: tok };
  }

  let core = tok.replace(CORE_RE, '');
  if (!core) {
    if (PUNCT_KEEP.has(tok)) {
      return { token: tok, kind: 'P', cleaned: tok };
    }
    return { token: tok, kind: 'J', cleaned: '' };
  }

  const hasTamil = TAMIL_RE.test(core);
  const hasLatin = LATIN_RE.test(core);

  if (hasTamil) {
    // If Tamil word with stray Latin characters injected by OCR noise
    if (hasLatin) {
      const sanitizedTok = tok.replace(LATIN_ALL_RE, '');
      core = sanitizedTok.replace(CORE_RE, '');
      if (!core) {
        return { token: tok, kind: 'J', cleaned: '' };
      }
      const tamilLen = (core.match(TAMIL_ALL_RE) || []).length;
      return { token: tok, kind: tamilLen <= 2 ? 'T' : 'G', cleaned: sanitizedTok };
    }

    // Number embedded in Tamil word with tiny text
    const digitsFree = core.replace(/[0-9]/g, '');
    if (/[0-9]/.test(core) && digitsFree.length <= 2) {
      return { token: tok, kind: 'J', cleaned: '' };
    }

    const tamilLen = (core.match(TAMIL_ALL_RE) || []).length;
    if (tok === core && tamilLen <= 2) {
      return { token: tok, kind: 'T', cleaned: tok };
    }
    return { token: tok, kind: 'G', cleaned: tok };
  }

  // Pure digits
  if (/^[0-9]+$/.test(core)) {
    return { token: tok, kind: 'N', cleaned: tok };
  }

  // Latin characters
  if (hasLatin) {
    if (/[0-9]/.test(core)) {
      return { token: tok, kind: 'J', cleaned: '' };
    }
    if (core.length === 1) {
      return core === 'X' || core === 'I' || core === 'V'
        ? { token: tok, kind: 'G', cleaned: tok }
        : { token: tok, kind: 'J', cleaned: '' };
    }
    if (answerMode && !COMMON_ENGLISH.has(core.toLowerCase()) && !isEnglishWord(core)) {
      return { token: tok, kind: 'J', cleaned: '' };
    }
    return isEnglishWord(core)
      ? { token: tok, kind: 'G', cleaned: tok }
      : { token: tok, kind: 'J', cleaned: '' };
  }

  return { token: tok, kind: 'J', cleaned: '' };
}

export function cleanLine(line: string, answerMode = false): {
  cleanText: string;
  tokensIn: number;
  tokensRemoved: number;
  tokensInfo: ClassifiedToken[];
} {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { cleanText: '', tokensIn: 0, tokensRemoved: 0, tokensInfo: [] };
  }

  const info = tokens.map((t) => classify(t, answerMode));
  const kinds = info.map((item) => item.kind);

  // If answer option consists exclusively of tiny letters/dashes/digits (e.g. "ஏ - ௭" or "3 1 4 2") -> keep all valid
  if (answerMode && kinds.every((k) => k === 'T' || k === 'P' || k === 'N')) {
    const keep = info.filter((item) => item.kind !== 'J').map((i) => i.cleaned);
    return {
      cleanText: keep.join(' '),
      tokensIn: tokens.length,
      tokensRemoved: tokens.length - keep.length,
      tokensInfo: info,
    };
  }

  const neighborKind = (i: number, step: number): TokenKind | null => {
    let j = i + step;
    while (j >= 0 && j < kinds.length) {
      if (kinds[j] !== 'J') {
        return kinds[j];
      }
      j += step;
    }
    return null;
  };

  const keep: string[] = [];
  for (let i = 0; i < info.length; i++) {
    const k = kinds[i];
    const cleanedTok = info[i].cleaned;

    if (k === 'G') {
      keep.push(cleanedTok);
    } else if (k === 'P') {
      const prevK = neighborKind(i, -1);
      const nextK = neighborKind(i, 1);
      if ((prevK === 'G' || prevK === 'N') && (nextK === 'G' || nextK === 'N')) {
        keep.push(cleanedTok);
      }
    } else if (k === 'N') {
      const p = i > 0 ? kinds[i - 1] : null;
      const n = i + 1 < kinds.length ? kinds[i + 1] : null;
      if (p === 'J' && n === 'J') {
        continue;
      }
      if (
        p === 'G' ||
        n === 'G' ||
        (p === null && n === 'T') ||
        (n === null && p === 'T') ||
        p === 'N' ||
        n === 'N'
      ) {
        keep.push(cleanedTok);
      }
    } else if (k === 'T') {
      const p = i > 0 ? kinds[i - 1] : null;
      const n = i + 1 < kinds.length ? kinds[i + 1] : null;
      if (
        (p === 'G' || p === 'P' || p === 'N') &&
        (n === 'G' || n === 'P' || n === 'N')
      ) {
        keep.push(cleanedTok);
      }
    }
  }

  return {
    cleanText: keep.join(' '),
    tokensIn: tokens.length,
    tokensRemoved: tokens.length - keep.length,
    tokensInfo: info,
  };
}

export function tidyText(text: string): string {
  if (!text) return '';
  let str = text.replace(/\s+([,.;:?!])/g, '$1');
  str = str.replace(/[ \t]{2,}/g, ' ').trim();
  return str;
}
