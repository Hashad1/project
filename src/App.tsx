import React from 'react';
import { ChatContainer } from './components/Chat/ChatContainer';
import { ChatHeader } from './components/Chat/ChatHeader';
import { ChatInput } from './components/Chat/ChatInput';
import { useVoiceInput } from './hooks/useVoiceInput';
import { useChat } from './hooks/useChat';

export default function App() {
  const { messages, isStreaming, sendMessage, stopAudio } = useChat();
  const { isListening, startListening } = useVoiceInput(sendMessage, stopAudio);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <ChatHeader />
          <ChatContainer messages={messages} isStreaming={isStreaming} />
          <ChatInput
            onSendMessage={sendMessage}
            onStartVoice={startListening}
            isListening={isListening}
          />
        </div>
      </div>
    </div>
  );
}