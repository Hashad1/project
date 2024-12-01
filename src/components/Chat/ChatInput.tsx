import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, FileUp } from 'lucide-react';
import { translations } from '../../utils/translations';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  onFileSelect: (file: File) => void;
  isListening: boolean;
  isProcessing: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  onStartVoice, 
  onStopVoice,
  onFileSelect,
  isListening,
  isProcessing 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={translations.placeholder}
            rows={1}
            disabled={isListening || isProcessing}
            dir="rtl"
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-orange-400 dark:focus:ring-orange-400"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            title={translations.uploadFile}
          >
            <FileUp size={20} />
          </button>
          
          <button
            type="button"
            onClick={isListening ? onStopVoice : onStartVoice}
            disabled={isProcessing}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              isListening
                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            title={isListening ? translations.stopRecording : translations.startRecording}
          >
            <Mic size={20} />
          </button>
          
          <button
            type="submit"
            disabled={!message.trim() || isProcessing}
            className="p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 transition-colors disabled:opacity-50"
            title={translations.send}
          >
            <Send size={20} />
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,image/*"
        />
      </form>
    </div>
  );
}