import { createWorker, Worker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { translations } from './translations';
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

// Initialize PDF.js worker
const pdfWorkerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

// Create a singleton worker instance
let tesseractWorker: Worker | null = null;

async function initTesseractWorker() {
  if (!tesseractWorker) {
    const workerOptions: WorkerOptions = {
      logger: (progress: any) => {
        console.log('OCR Progress:', progress);
      }
    };
    tesseractWorker = await createWorker(workerOptions);
    await tesseractWorker.loadLanguage('ara+eng');
    await tesseractWorker.reinitialize('ara+eng');
  }
  return tesseractWorker;
}

export async function processFile(file: File): Promise<string> {
  try {
    if (!file) {
      throw new Error(translations.fileTypeError);
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error(translations.fileSizeError);
    }

    const content = await extractContent(file);
    return content;
  } catch (error) {
    console.error('Error processing file:', error);
    throw error instanceof Error ? error : new Error(translations.fileProcessingError);
  }
}

async function extractContent(file: File): Promise<string> {
  const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (supportedImageTypes.includes(file.type)) {
    return await processImage(file);
  } else if (file.type === 'application/pdf') {
    return await processPDF(file);
  } else if (file.type === 'text/plain') {
    return await processText(file);
  } else {
    throw new Error(translations.fileTypeError);
  }
}

async function processImage(file: File): Promise<string> {
  try {
    const worker = await initTesseractWorker();
    if (!worker) {
      throw new Error('OCR worker initialization failed');
    }

    const result = await worker.recognize(file);
    const text = result.data.text;

    if (!text || text.trim().length === 0) {
      throw new Error(translations.noTextFound);
    }

    return text.trim();
  } catch (error) {
    console.error('Error processing image:', error);
    throw error instanceof Error ? error : new Error(translations.fileProcessingError);
  }
}

async function processPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: TextItem | TextMarkedContent) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n\n';
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error(translations.noTextFound);
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error instanceof Error ? error : new Error(translations.fileProcessingError);
  }
}

async function processText(file: File): Promise<string> {
  try {
    const text = await file.text();
    if (!text || text.trim().length === 0) {
      throw new Error(translations.noTextFound);
    }
    return text.trim();
  } catch (error) {
    console.error('Error processing text file:', error);
    throw error instanceof Error ? error : new Error(translations.fileProcessingError);
  }
}

export async function cleanupTesseract() {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}