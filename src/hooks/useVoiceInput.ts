import { useState, useCallback, useRef } from 'react';
import { translations } from '../utils/translations';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: { error: string }) => void;
  onresult: (event: {
    resultIndex: number;
    results: {
      [index: number]: {
        isFinal: boolean;
        [index: number]: {
          transcript: string;
        };
      };
    };
  }) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useVoiceInput(onResult: (transcript: string) => void, stopAudio: () => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(translations.speechNotSupported);
      return;
    }

    stopAudio();

    if (!recognitionRef.current) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-SA'; // Arabic (Saudi Arabia)
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        console.log('Recognized text:', transcript);
        
        if (lastResult.isFinal) {
          onResult(transcript);
        }
      };
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  }, [onResult, stopAudio]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    startListening,
    stopListening
  };
}