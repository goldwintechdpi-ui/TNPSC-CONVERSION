import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    engine: 'Tamil Examination OCR & Question Bank Studio',
    version: '2.0',
  });
});

app.post('/api/gemini/extract-questions', async (req, res) => {
  if (!ai) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY is not configured on the server. Falling back to local OCR parser.',
    });
  }

  const {
    imageParts,
    rawText,
    qFrom = 1,
    qTo = 100,
    testSeries = 'TNPSC',
    questionBank = '20242',
  } = req.body;

  try {
    const contents: any[] = [];

    // System/user prompt for high accuracy Tamil & Bilingual question bank parsing
    const systemPrompt = `You are a specialist in Tamil Nadu public exam question papers (TNPSC Group 1/2/4, TRB, TNUSRB, TET).
Your task is to accurately extract numbered examination questions from number ${qFrom} to ${qTo}.

CRITICAL RULES:
1. Examine each question carefully. Tamil questions often have both Tamil and English text, or only Tamil. Preserve authentic Tamil Unicode (உயிரெழுத்துக்கள், மெய்யெழுத்துக்கள், உயிர்மெய்) without corrupting combining characters (ெ, ே, ை, ொ, ோ, ௌ).
2. Separate the Question stem from the Options (A) through (E).
3. Question Stem: Put ONLY the question text (and any associated tables/sub-points like (i), (ii), or matching columns (a), (b), (c), (d)) in the question field.
4. Options: Format the options with exact labels:
(A) [option text]
(B) [option text]
(C) [option text]
(D) [option text]
(E) விடை தெரியவில்லை (If TNPSC Option E is present or answer not known, standard canonical Tamil is "விடை தெரியவில்லை").
5. Drop junk characters, stray scanner marks, page numbers, header/footer text (e.g. "Page 1 of 12", "TURN OVER", "GENERAL STUDIES", booklet codes like "GS/2024").
6. Correct Answer: If an answer key mark or underline is detected, note it in correctAnswer; otherwise leave as null.
7. Return clean JSON matching the schema provided.`;

    if (imageParts && Array.isArray(imageParts) && imageParts.length > 0) {
      for (const img of imageParts) {
        contents.push({
          inlineData: {
            mimeType: img.mimeType || 'image/jpeg',
            data: img.base64,
          },
        });
      }
      contents.push({
        text: `${systemPrompt}\n\nExtract questions numbered ${qFrom} to ${qTo} from these exam page images. Output valid JSON array with objects: { "number": number, "question": string, "answers": string, "correctAnswer": string | null, "reviewNotes": string | null, "pageNumber": number }`,
      });
    } else if (rawText) {
      contents.push({
        text: `${systemPrompt}\n\nHere is the raw OCR text extracted from the document:\n\n${rawText}\n\nExtract questions numbered ${qFrom} to ${qTo}. Output valid JSON array with objects: { "number": number, "question": string, "answers": string, "correctAnswer": string | null, "reviewNotes": string | null }`,
      });
    } else {
      return res.status(400).json({ error: 'No image or text provided' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '[]';
    let parsedData = [];
    try {
      parsedData = JSON.parse(responseText);
      if (!Array.isArray(parsedData) && typeof parsedData === 'object' && (parsedData as any).questions) {
        parsedData = (parsedData as any).questions;
      }
    } catch {
      parsedData = [];
    }

    res.json({
      success: true,
      questions: parsedData,
      testSeries,
      questionBank,
    });
  } catch (err: any) {
    console.error('Error during Gemini extraction:', err);
    res.status(500).json({
      error: err.message || 'Failed to extract questions with Gemini',
    });
  }
});

async function startServer() {
  const port = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
