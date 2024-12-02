import { createWorker, createScheduler, Worker, Scheduler } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { translations } from './translations';
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Create singleton instances for OCR
let tesseractWorker: Worker | null = null;
let scheduler: Scheduler | null = null;

async function initTesseractWorker() {
  if (!tesseractWorker) {
    try {
      console.log('Initializing Tesseract worker...');
      
      // Create worker with both Arabic and English languages
      tesseractWorker = await createWorker('ara+eng');
      console.log('Worker initialized');

      // Create and setup scheduler
      scheduler = createScheduler();
      if (scheduler && tesseractWorker) {
        scheduler.addWorker(tesseractWorker);
        console.log('Worker added to scheduler');
      }
      
      console.log('Tesseract worker setup completed');
    } catch (error) {
      console.error('Error initializing Tesseract worker:', error);
      throw new Error('Failed to initialize OCR worker');
    }
  }
  return tesseractWorker;
}

export async function processFile(file: File): Promise<string> {
  try {
    if (!file) {
      throw new Error(translations.fileTypeError);
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

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
  console.log('Extracting content from file type:', file.type);

  try {
    if (supportedImageTypes.includes(file.type)) {
      return await processImage(file);
    } else if (file.type === 'application/pdf') {
      return await processPDF(file);
    } else if (file.type === 'text/plain') {
      return await processText(file);
    } else {
      throw new Error(translations.fileTypeError);
    }
  } catch (error) {
    console.error('Error in extractContent:', error);
    throw error;
  }
}

async function processImage(file: File): Promise<string> {
  console.log('Processing image:', file.name);
  try {
    await initTesseractWorker();
    
    if (!tesseractWorker || !scheduler) {
      throw new Error('OCR worker initialization failed');
    }

    // Convert File to image data URL
    const imageUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    console.log('Starting OCR recognition...');
    // Recognize text using the worker directly
    const { data } = await tesseractWorker.recognize(imageUrl);
    console.log('OCR recognition completed');

    if (!data.text || data.text.trim().length === 0) {
      throw new Error(translations.noTextFound);
    }

    console.log('Image processed successfully');
    return data.text.trim();
  } catch (error) {
    console.error('Error processing image:', error);
    throw error instanceof Error ? error : new Error(translations.fileProcessingError);
  }
}

async function processPDF(file: File): Promise<string> {
  console.log('Processing PDF:', file.name);
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing PDF page ${i} of ${pdf.numPages}`);
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

    console.log('PDF processed successfully');
    return fullText.trim();
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error instanceof Error ? error : new Error(translations.fileProcessingError);
  }
}

async function processText(file: File): Promise<string> {
  console.log('Processing text file:', file.name);
  try {
    const text = await file.text();
    if (!text || text.trim().length === 0) {
      throw new Error(translations.noTextFound);
    }
    console.log('Text file processed successfully');
    return text.trim();
  } catch (error) {
    console.error('Error processing text file:', error);
    throw error instanceof Error ? error : new Error(translations.fileProcessingError);
  }
}

export async function cleanupTesseract() {
  try {
    if (scheduler) {
      await scheduler.terminate();
      scheduler = null;
    }
    if (tesseractWorker) {
      await tesseractWorker.terminate();
      tesseractWorker = null;
    }
    console.log('Tesseract cleanup completed successfully');
  } catch (error) {
    console.error('Error during Tesseract cleanup:', error);
  }
}