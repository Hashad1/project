import React from 'react';
import { ChatContainer } from './components/Chat/ChatContainer';
import { ChatHeader } from './components/Chat/ChatHeader';
import { ChatInput } from './components/Chat/ChatInput';
import { useVoiceInput } from './hooks/useVoiceInput';
import { useChat } from './hooks/useChat';
import { FileUpload } from './components/Chat/FileUpload';

export default function App() {
  const { messages, isStreaming, handleSendMessage, handleFileUpload, stopAudio } = useChat();
  const { isListening, startListening, stopListening } = useVoiceInput(handleSendMessage, stopAudio);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" dir="rtl">
      <div className="h-full w-full p-2 sm:p-4 md:p-8">
        <div className="mx-auto h-full max-w-4xl">
          <div className="flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
            <ChatHeader />
            <div className="flex-1 overflow-hidden">
              <ChatContainer messages={messages} isStreaming={isStreaming} />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <FileUpload onFileSelect={handleFileUpload} />
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {isListening ? 'توقف عن التسجيل' : 'ابدأ التسجيل'}
                  </button>
                </div>
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onStartVoice={startListening}
                  onStopVoice={stopListening}
                  isListening={isListening}
                  isProcessing={isStreaming}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}