export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp?: Date;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  audioUrl?: string;
  error?: string;
}

export interface ChatProps {
  messages: Message[];
  isStreaming: boolean;
  onFileUpload: (file: File) => Promise<void>;
  onVoiceMessage: (blob: Blob) => Promise<void>;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  isListening: boolean;
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number;
}

export interface VoiceInputProps {
  onStart: () => void;
  onStop: () => void;
  isListening: boolean;
}

export interface ChatHeaderProps {
  title?: string;
}

export type FileProcessingError = {
  code: string;
  message: string;
}
