export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  imageUri?: string; // Optional image URI for image messages
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  apiKey: string | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  deleteMessage: (id: string) => void;
  setApiKey: (key: string) => void;
  clearChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  sendImage: (imageUri: string) => Promise<void>;
  sendScarlettPhoto: () => void; // Added this function to the interface
}