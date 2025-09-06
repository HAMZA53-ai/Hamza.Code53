
export enum ChatRole {
  User = 'user',
  Model = 'model',
  Error = 'error',
}

export type View = 'chat' | 'tools' | 'blog' | 'creations' | 'settings';

export type CreationType = 'Image' | 'Website' | 'Logo' | 'EditedImage' | 'Slides' | 'Video';
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
  provider: string;
  model: string;
  totalTokens?: number;
}

export interface ChatMessage {
  id:string;
  role: ChatRole;
  parts: MessagePart[];
  debugInfo?: DebugInfo;
  groundingSources?: { title: string; uri: string }[];
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

export type ChatMode = 'default' | 'google_search' | 'quick_response' | 'learning';

// إصلاح: إضافة نوع VideoAnalysisResult لأداة معالجة الفيديو.
export interface VideoAnalysisResult {
    summary: string;
    quiz: QuizQuestion[];
}

export interface ToolSettings {
    imageGenerator?: {
        aspectRatio: "1:1" | "9:16" | "16:9" | "4:3" | "3:4";
        numberOfImages: number;
    };
    websiteGenerator?: {
        techStack: WebTechStack;
        language: string;
    };
    quizGenerator?: {
        quizType: QuizType;
        questionCount: number;
    };
    logoGenerator?: {
        style: string;
    };
    translationSummarization?: {
        targetLanguage: string;
    };
}