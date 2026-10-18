import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { ExtractedQuestion, ReviewItem, RawPageLine } from './types';

export const TAMIL_FONT_NAME = 'Noto Sans Tamil';

export function exportToXLSX(
  questions: ExtractedQuestion[],
  review: ReviewItem[],
  rawLines: RawPageLine[],
  testSeries: string,
  questionBank: string,
  filename = 'tamil_question_bank.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Questions
  const questionsData: any[] = [
    ['TestSeries', 'QuestionBank', 'QuestionNo', 'Number', 'Question', 'Anwers', 'CorrectAnswer'],
  ];

  questions.forEach((q, idx) => {
    const rowNum = idx + 2;
    questionsData.push([
      q.testSeries || testSeries,
      q.questionBank || questionBank,
      { f: `CONCATENATE(A${rowNum},"-",B${rowNum},"-",D${rowNum})`, v: `${testSeries}-${questionBank}-${q.number}` },
      q.number,
      q.question,
      q.answers,
      q.correctAnswer || null,
    ]);
  });

  const wsQuestions = XLSX.utils.aoa_to_sheet(questionsData);
  wsQuestions['!cols'] = [
    { wch: 14 }, // A: TestSeries
    { wch: 16 }, // B: QuestionBank
    { wch: 22 }, // C: QuestionNo
    { wch: 10 }, // D: Number
    { wch: 75 }, // E: Question
    { wch: 75 }, // F: Anwers
    { wch: 16 }, // G: CorrectAnswer
  ];
  XLSX.utils.book_append_sheet(wb, wsQuestions, 'Questions');

  // Sheet 2: Needs review
  const reviewData: any[] = [['Number', 'Problem']];
  review.forEach((r) => {
    reviewData.push([r.number, r.problem]);
  });
  const wsReview = XLSX.utils.aoa_to_sheet(reviewData);
  wsReview['!cols'] = [{ wch: 12 }, { wch: 100 }];
  XLSX.utils.book_append_sheet(wb, wsReview, 'Needs review');

  // Sheet 3: Raw text
  const rawData: any[] = [['Page', 'Column', 'Line', 'Text']];
  rawLines.forEach((r) => {
    rawData.push([r.page, r.col, r.line, r.text]);
  });
  const wsRaw = XLSX.utils.aoa_to_sheet(rawData);
  wsRaw['!cols'] = [{ wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 100 }];
  XLSX.utils.book_append_sheet(wb, wsRaw, 'Raw text');

  // Trigger file download
  XLSX.writeFile(wb, filename);
}

export async function exportToDOCX(
  questions: ExtractedQuestion[],
  filename = 'tamil_question_bank.docx'
) {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: 'Tamil & English Examination Question Bank',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    })
  );

  for (const q of questions) {
    // Question Header with Noto Sans Tamil font
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${q.number}. `,
            bold: true,
            size: 24,
            font: TAMIL_FONT_NAME,
          }),
          new TextRun({
            text: q.question,
            size: 24,
            font: TAMIL_FONT_NAME,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    // Answer options with Noto Sans Tamil font
    const optLines = q.answers.split('\n');
    for (const opt of optLines) {
      if (!opt.trim()) continue;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `   ${opt}`,
              size: 22,
              font: TAMIL_FONT_NAME,
            }),
          ],
          spacing: { after: 50 },
        })
      );
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: TAMIL_FONT_NAME,
            size: 24,
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename);
}

export function exportToTXT(
  questions: ExtractedQuestion[],
  filename = 'tamil_question_bank.txt'
) {
  let content = '';
  for (const q of questions) {
    content += `${q.number}. ${q.question}\n${q.answers}\n\n`;
  }
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}

export function exportToJSON(
  questions: ExtractedQuestion[],
  review: ReviewItem[],
  testSeries: string,
  questionBank: string,
  filename = 'tamil_question_bank.json'
) {
  const payload = {
    exportedAt: new Date().toISOString(),
    font: TAMIL_FONT_NAME,
    testSeries,
    questionBank,
    stats: {
      totalQuestions: questions.length,
      needsReviewCount: review.length,
    },
    questions,
    review,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
