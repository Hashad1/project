import React from 'react';
import { Message } from '../../types/chat';
import { formatMessage } from '../../utils/messageFormatter';

interface ChatMessageProps {
  message: Message;
  isStreaming: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const formattedMessage = formatMessage(message.text);

  return (
    <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`relative max-w-[85%] rounded-lg px-4 py-3 shadow-sm ${
          message.isBot
            ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
            : 'bg-orange-500 text-white'
        } ${isStreaming ? 'animate-pulse' : ''}`}
      >
        <div className="prose dark:prose-invert max-w-none text-right whitespace-pre-wrap break-words">
          {message.error ? (
            <span className="text-red-500 dark:text-red-400">{message.text}</span>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: formattedMessage }} />
          )}
          {message.fileUrl && (
            <div className="mt-2">
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {message.fileName || 'Download File'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}