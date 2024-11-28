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
        className={`rounded-xl p-3 transition-all duration-200 ${
          isProcessing
            ? 'bg-gray-200 cursor-not-allowed'
            : error
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={error || translations.uploadFile}
      >
        {isProcessing ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <FileUp size={20} />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.webp"
        disabled={isProcessing}
      />
      {error && (
        <div className="absolute bottom-full mb-2 right-0 w-64 p-2 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
}