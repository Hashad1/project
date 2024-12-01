export interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

export interface ChatProps {
  messages: Message[];
  isStreaming: boolean;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStartVoice: () => void;
  isListening: boolean;
}

export interface ChatHeaderProps {
  title?: string;
}
