import React from 'react';
import { Bot, User } from 'lucide-react';
import { formatMessage } from '../../utils/messageFormatter';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isBot, isStreaming }: ChatMessageProps) {
  const formattedMessage = formatMessage(message);

  return (
    <div className={`flex gap-4 p-6 ${isBot ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isBot 
          ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 dark:from-orange-900 dark:to-orange-800 dark:text-orange-300' 
          : 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 dark:from-purple-900 dark:to-purple-800 dark:text-purple-300'
      }`}>
        {isBot ? <Bot size={24} /> : <User size={24} />}
      </div>
      <div className="flex-1 space-y-1">
        <div className="font-medium text-sm text-gray-600 dark:text-gray-400">
          {isBot ? 'المستشار الذكي' : 'أنت'}
        </div>
        <div 
          className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formattedMessage }}
        />
        {isStreaming && (
          <div className="flex gap-1 mt-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>
        )}
      </div>
    </div>
  );
}