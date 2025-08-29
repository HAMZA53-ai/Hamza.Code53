export enum ChatRole {
  User = 'user',
  Model = 'model',
  Error = 'error',
}

// FIX: Add 'messenger' to View type to support the new Messenger section.
export type View = 'chat' | 'image' | 'video' | 'website' | 'book' | 'messenger' | 'creations' | 'settings';

export type CreationType = 'Image' | 'Video' | 'Website' | 'Book';
export type CreationStatus = 'pending' | 'completed' | 'failed';

export interface Creation {
  id: string;
  type: CreationType;
  prompt: string;
  status: CreationStatus;
  timestamp: number;
  data?: any; // Could be image URLs, video URL, HTML code etc.
  error?: string;
}

export interface BookContent {
  title: string;
  cover_query: string;
  chapters: {
    title: string;
    content: string;
  }[];
  cover_url?: string;
}

export interface ImagePart {
  type: 'image';
  data: string; // base64 string
  mimeType: string;
}

export interface TextPart {
  type: 'text';
  text: string;
}

export type MessagePart = ImagePart | TextPart;

export interface DebugInfo {
  responseTimeMs: number;
  model: string;
  totalTokens?: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  parts: MessagePart[];
  debugInfo?: DebugInfo;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
}

// --- Messenger Types ---
// FIX: Add types for the new Messenger feature.
export interface AIFriend {
  id: string;
  name: string;
  avatarUrl: string;
  systemInstruction: string;
  initialMessage: string;
}

export interface MessengerMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export interface FriendConversation {
    friendId: string;
    messages: MessengerMessage[];
}