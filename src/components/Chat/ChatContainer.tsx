import { useRef, useEffect } from 'react';
import { Message } from '../../types/chat';
import { ChatMessage } from './ChatMessage';

interface ChatContainerProps {
  messages: Message[];
  isStreaming: boolean;
}

export function ChatContainer({ messages, isStreaming }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            مرحباً! كيف يمكنني مساعدتك اليوم؟
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isStreaming={isStreaming && message.id === messages[messages.length - 1]?.id}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}