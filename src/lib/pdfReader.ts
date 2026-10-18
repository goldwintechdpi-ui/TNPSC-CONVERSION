import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  } catch (e) {
    console.warn('Could not set GlobalWorkerOptions.workerSrc', e);
  }
}

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
  isScanned: boolean;
  images: { page: number; base64: string }[];
}

export interface PdfReadOptions {
  maxPages?: number;
  onProgress?: (pageNum: number, totalPages: number, pageTextSnippet: string) => void;
}

export async function readPdfFile(
  file: File,
  options?: PdfReadOptions
): Promise<ExtractedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const maxPagesAllowed = options?.maxPages || 100;

  const parseWithTimeout = new Promise<ExtractedPdfResult>(async (resolve, reject) => {
    // Generous timeout for large multi-page 100-question PDFs
    const timer = setTimeout(() => {
      reject(new Error('PDF loading timeout - falling back to direct stream parser'));
    }, 30000);

    try {
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      let fullText = '';
      const images: { page: number; base64: string }[] = [];
      let totalExtractedChars = 0;

      const maxPagesToProcess = Math.min(numPages, maxPagesAllowed);

      for (let pageNum = 1; pageNum <= maxPagesToProcess; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();

          const items = textContent.items as any[];
          const linesMap: { [y: number]: string[] } = {};
          for (const item of items) {
            if (typeof item.str === 'string') {
              const y = Math.round(item.transform?.[5] || 0);
              const existingY = Object.keys(linesMap).find((k) => Math.abs(Number(k) - y) < 4);
              const targetY = existingY ? Number(existingY) : y;
              if (!linesMap[targetY]) linesMap[targetY] = [];
              linesMap[targetY].push(item.str);
            }
          }

          const sortedYs = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
          const pageLines: string[] = [];
          for (const y of sortedYs) {
            const lineStr = linesMap[y].join(' ').trim();
            if (lineStr) pageLines.push(lineStr);
          }

          const pageText = pageLines.join('\n');
          totalExtractedChars += pageText.length;
          fullText += `===== Page ${pageNum} =====\n${pageText}\n\n`;

          // Report real-time progress to listener
          if (options?.onProgress) {
            options.onProgress(pageNum, numPages, pageLines[0] || `Page ${pageNum}`);
          }

          // Render canvas preview for first 3 pages only to keep performance ultra fast offline
          if (pageNum <= 3) {
            try {
              const viewport = page.getViewport({ scale: 1.2 });
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (ctx) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: ctx, viewport } as any).promise;
                const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                const base64 = dataUrl.split(',')[1];
                if (base64) {
                  images.push({ page: pageNum, base64 });
                }
              }
            } catch (renderErr) {
              console.warn(`Could not render PDF preview page ${pageNum}:`, renderErr);
            }
          }
        } catch (pageErr) {
          console.warn(`Error reading page ${pageNum}:`, pageErr);
        }
      }

      clearTimeout(timer);

      const isScanned = totalExtractedChars < Math.max(1, maxPagesToProcess) * 20;

      if (!fullText.trim()) {
        fullText = `===== Page 1 =====\n(Uploaded PDF: ${file.name})\n[Scanned or image-based PDF with ${numPages} page(s). Ready for extraction.]`;
      }

      resolve({
        text: fullText.trim(),
        pageCount: numPages || 1,
        isScanned,
        images,
      });
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });

  try {
    return await parseWithTimeout;
  } catch (pdfErr: any) {
    console.warn(`PDF.js load fallback:`, pdfErr);

    // Resilient fallback: convert raw file to base64 so user can still see and process it
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = (reader.result as string) || '';
        resolve(res.split(',')[1] || '');
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });

    return {
      text: `===== Page 1 =====\n(Uploaded Document: ${file.name})\n[Document added to folder (${Math.round(file.size / 1024)} KB). Click 'Run Extraction' to extract questions.]`,
      pageCount: 1,
      isScanned: true,
      images: base64Data ? [{ page: 1, base64: base64Data }] : [],
    };
  }
}

export function readImageFileAsBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(',');
      const mimeType = header?.match(/:(.*?);/)?.[1] || file.type || 'image/jpeg';
      resolve({ base64: base64 || '', mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
