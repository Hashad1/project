import React, { useRef, useState, useEffect } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { translations } from '../../utils/translations';
import { processFile, cleanupTesseract } from '../../utils/fileProcessor';

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      cleanupTesseract();
    };
  }, []);

  const handleClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const content = await processFile(file);
      onFileSelect(file, content);
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : translations.fileProcessingError);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isProcessing
            ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
        } text-gray-700 dark:text-gray-200`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin inline-block ml-1" />
            <span>{translations.processingFile}</span>
          </>
        ) : (
          <>
            <FileUp className="w-5 h-5 inline-block ml-1" />
            <span>{translations.uploadFile}</span>
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.txt,.doc,.docx,image/*"
      />
      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm rounded-lg p-2 z-10">
          {error}
        </div>
      )}
    </div>
  );
}