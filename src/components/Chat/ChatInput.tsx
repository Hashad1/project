import React, { useState } from 'react';
import { Mic, ArrowUp } from 'lucide-react';
import { translations } from '../../utils/translations';
import { FileUpload } from './FileUpload';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStartVoice: () => void;
  isListening: boolean;
}

export function ChatInput({ onSendMessage, onStartVoice, isListening }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleFileSelect = (file: File) => {
    onSendMessage(`${translations.fileUploaded}: ${file.name}`);
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-100 p-6 bg-white">
      <div className="flex gap-3 items-center">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!message.trim()}
            className={`rounded-xl p-3 transition-all duration-200 ${
              message.trim()
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 hover:shadow-orange-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            aria-label={translations.send}
          >
            <ArrowUp size={20} />
          </button>
          <button
            type="button"
            onClick={onStartVoice}
            className={`rounded-xl p-3 transition-all duration-200 ${
              isListening
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Mic size={20} />
          </button>
          <FileUpload onFileSelect={handleFileSelect} />
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={translations.placeholder}
          className="flex-1 px-6 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-orange-500 text-right placeholder:text-gray-400"
          dir="rtl"
        />
      </div>
    </form>
  );
}