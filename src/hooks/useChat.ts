import { useState, useCallback, useEffect, useRef } from 'react';
import { createThread, sendMessage, streamResponse } from '../utils/openai';
import { Message } from '../types/chat';
import { translations } from '../utils/translations';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      text: translations.welcome,
      isBot: true,
    },
    {
      id: 'welcome-2',
      text: translations.suggestions,
      isBot: true,
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      URL.revokeObjectURL(audioRef.current.src);
    }
  }, []);

  useEffect(() => {
    async function initThread() {
      try {
        const newThreadId = await createThread();
        setThreadId(newThreadId);
      } catch (error) {
        console.error('Error initializing thread:', error);
        setMessages(prev => [...prev, {
          id: 'error-init',
          text: translations.error,
          isBot: true,
          error: true
        }]);
      }
    }
    initThread();

    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => {
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    });

    return () => {
      stopAudio();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [stopAudio]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!threadId || isProcessingRef.current || !text.trim()) return;
    
    isProcessingRef.current = true;
    setIsStreaming(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const runId = await sendMessage(threadId, text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        isBot: true,
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      await streamResponse(threadId, runId, (chunk) => {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.isBot) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, text: chunk }
            ];
          }
          return prev;
        });
      });
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: translations.error,
          isBot: true,
          error: true
        }
      ]);
    } finally {
      isProcessingRef.current = false;
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [threadId]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!threadId || isProcessingRef.current) return;
    
    try {
      // Handle file upload logic here
      const formData = new FormData();
      formData.append('file', file);
      
      // For now, just send a message about the file
      await handleSendMessage(`Uploaded file: ${file.name}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: translations.fileError,
          isBot: true,
          error: true
        }
      ]);
    }
  }, [threadId, handleSendMessage]);

  return {
    messages,
    isStreaming,
    handleSendMessage,
    handleFileUpload,
    stopAudio
  };
}