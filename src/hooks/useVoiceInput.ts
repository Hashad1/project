import { useState, useCallback, useRef } from 'react';
import { translations } from '../utils/translations';

export function useVoiceInput(
  onResult: (transcript: string) => void,
  onStartListening: () => void
) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    setIsListening(false);
    finalTranscriptRef.current = '';
  }, []);

  const resetSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    // Increased silence timeout to 3 seconds
    silenceTimeoutRef.current = setTimeout(() => {
      if (finalTranscriptRef.current.trim()) {
        onResult(finalTranscriptRef.current.trim());
      }
      stopRecognition();
    }, 3000);
  }, [onResult, stopRecognition]);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(translations.speechNotSupported);
      return;
    }

    // If already listening, stop the recognition
    if (isListening) {
      stopRecognition();
      return;
    }

    // Stop any playing audio before starting to listen
    onStartListening();

    const recognition = new (window as any).webkitSpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      finalTranscriptRef.current = '';
      resetSilenceTimeout();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        resetSilenceTimeout();
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      stopRecognition();
    };

    recognition.onend = () => {
      if (isListening && !finalTranscriptRef.current.trim()) {
        // Only restart if we're still supposed to be listening and no final transcript
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting speech recognition:', error);
          stopRecognition();
        }
      } else {
        stopRecognition();
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      stopRecognition();
    }
  }, [isListening, resetSilenceTimeout, stopRecognition, onStartListening]);

  return { isListening, startListening };
}