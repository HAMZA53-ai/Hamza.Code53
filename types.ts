export enum ChatRole {
  User = 'user',
  Model = 'model',
  Error = 'error',
}

export type View = 'chat' | 'tools' | 'blog' | 'creations' | 'settings';

// FIX: Add new creation types for all generated content.
export type CreationType = 'Image' | 'Video' | 'Website' | 'Logo' | 'EditedImage' | 'Slides';
export type CreationStatus = 'pending' | 'completed' | 'failed';

export type WebTechStack = 'html-css' | 'tailwind' | 'react-tailwind';

export interface Creation {
  id: string;
  type: CreationType;
  prompt: string;
  status: CreationStatus;
  timestamp: number;
  data?: any; // Could be image URLs, video URL, HTML code etc.
  error?: string;
  techStack?: WebTechStack;
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
  id:string;
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

export type QuizType = 'multiple-choice' | 'true-false';

export interface QuizQuestion {
    question: string;
    options?: string[];
    answer: string;
}

export interface Slide {
    title: string;
    content: string; // Bullet points as a single string
}