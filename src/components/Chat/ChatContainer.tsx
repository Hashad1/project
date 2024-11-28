import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

interface ChatContainerProps {
  messages: Message[];
  isStreaming: boolean;
}

export function ChatContainer({ messages, isStreaming }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      const maxScroll = scrollHeight - clientHeight;
      
      // Smooth scroll to bottom
      containerRef.current.scrollTo({
        top: maxScroll,
        behavior: 'smooth'
      });
    }
  }, [messages, isStreaming]); // Re-run when messages or streaming state changes

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth" 
      style={{ height: 'calc(100vh - 280px)' }}
    >
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isBot={message.isBot}
            isStreaming={isStreaming && message.id === messages[messages.length - 1].id && message.isBot}
          />
        ))}
      </div>
    </div>
  );
}