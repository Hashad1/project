import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
const pdfWorkerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

// Create a singleton worker instance
let tesseractWorker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function initTesseractWorker() {
  if (!tesseractWorker) {
    tesseractWorker = await createWorker();
    await tesseractWorker.loadLanguage('ara+eng');
    await tesseractWorker.initialize('ara+eng');
  }
  return tesseractWorker;
}

export async function processFile(file: File): Promise<string> {
  try {
    if (!file) {
      throw new Error('لم يتم اختيار ملف');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت');
    }

    const content = await extractContent(file);
    return content;
  } catch (error) {
    console.error('Error processing file:', error);
    throw error instanceof Error ? error : new Error('فشل في معالجة الملف');
  }
}

async function extractContent(file: File): Promise<string> {
  const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const supportedDocTypes = ['application/pdf', 'text/plain'];

  if (supportedImageTypes.includes(file.type)) {
    return await processImage(file);
  } else if (file.type === 'application/pdf') {
    return await processPDF(file);
  } else if (file.type === 'text/plain') {
    return await processText(file);
  }
  
  throw new Error('نوع الملف غير مدعوم. الأنواع المدعومة هي: PDF، صور (JPG, PNG)، ومستندات نصية');
}

async function processImage(file: File): Promise<string> {
  try {
    const worker = await initTesseractWorker();
    const imageUrl = URL.createObjectURL(file);
    
    const { data: { text } } = await worker.recognize(imageUrl);
    URL.revokeObjectURL(imageUrl);
    
    if (!text || text.trim().length === 0) {
      throw new Error('لم يتم العثور على نص قابل للقراءة في الصورة');
    }

    return `محتوى النص المستخرج من الصورة:\n\n${text}`;
  } catch (error) {
    console.error('Error processing image:', error);
    if (tesseractWorker) {
      await tesseractWorker.terminate();
      tesseractWorker = null;
    }
    throw error instanceof Error ? error : new Error('فشل في معالجة الصورة');
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
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('لم يتم العثور على نص في ملف PDF');
    }

    return `محتوى ملف PDF:\n\n${fullText.trim()}`;
  } catch (error) {
    console.error('Error processing PDF:', error);
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF structure')) {
        throw new Error('ملف PDF تالف أو غير صالح');
      } else if (error.message.includes('Encrypted PDF')) {
        throw new Error('لا يمكن قراءة ملف PDF المحمي');
      }
    }
    throw new Error('فشل في قراءة ملف PDF');
  }
}

async function processText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string' || content.trim().length === 0) {
          throw new Error('الملف فارغ أو غير صالح');
        }
        resolve(`محتوى الملف النصي:\n\n${content}`);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('فشل في معالجة محتوى الملف'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('فشل في قراءة الملف'));
    };

    reader.readAsText(file);
  });
}

export async function cleanupTesseract() {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}