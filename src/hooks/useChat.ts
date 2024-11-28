import { useState, useCallback, useEffect, useRef } from 'react';
import { createThread, sendMessage, streamResponse } from '../utils/openai';
import { Message } from '../types/message';
import { translations } from '../utils/translations';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function initThread() {
      try {
        const newThreadId = await createThread();
        setThreadId(newThreadId);
        
        setMessages([
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
      } catch (error) {
        console.error('Error initializing thread:', error);
        setMessages([{
          id: 'error-init',
          text: translations.error,
          isBot: true,
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
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      URL.revokeObjectURL(audioRef.current.src);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File, content: string) => {
    if (!threadId || isProcessingRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: `${translations.fileUploaded}: ${file.name}\n\n${content}`,
      isBot: false,
    };

    await handleSendMessage(userMessage.text);
  }, [threadId]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!threadId || isProcessingRef.current) return;

    // Create new abort controller for this message
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    isProcessingRef.current = true;
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      const runId = await sendMessage(threadId, text);
      const botMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: botMessageId,
        text: '',
        isBot: true,
      }]);

      for await (const chunk of streamResponse(threadId, runId)) {
        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        if (typeof chunk === 'string') {
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: chunk } : msg
          ));
        } else if (chunk.audio) {
          const audioUrl = URL.createObjectURL(chunk.audio);
          if (audioRef.current && !abortControllerRef.current?.signal.aborted) {
            audioRef.current.src = audioUrl;
            try {
              await audioRef.current.play();
            } catch (error) {
              console.error('Error playing audio:', error);
              URL.revokeObjectURL(audioUrl);
            }
          } else {
            URL.revokeObjectURL(audioUrl);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Ignore abort errors
        return;
      }
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: translations.error,
        isBot: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      isProcessingRef.current = false;
    }
  }, [threadId]);

  return {
    messages,
    isStreaming,
    sendMessage: handleSendMessage,
    handleFileUpload,
    stopAudio,
  };
}