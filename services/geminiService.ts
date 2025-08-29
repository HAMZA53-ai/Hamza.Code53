import { GoogleGenAI, GenerateContentResponse, GenerateImagesResponse, Type, Content } from "@google/genai";
import { ChatMessage, ChatRole, DebugInfo, BookContent } from "../types";
import * as apiKeyService from './apiKeyService';

const handleApiError = (error: unknown, context: string): Error => {
    console.error(`Gemini API Error (${context}):`, error);
    if (error instanceof Error) {
        // Check for common API error patterns in the message
        if (error.message.includes('{') && error.message.includes('}')) {
            try {
                // Extract JSON part from a potentially larger string like "400 Bad Request: { ... }"
                const jsonString = error.message.substring(error.message.indexOf('{'));
                const errorDetails = JSON.parse(jsonString);
                
                if (errorDetails.error) {
                    const { message, status } = errorDetails.error;
                    if (status === 'RESOURCE_EXHAUSTED') {
                        return new Error("لقد تجاوزت حصة الاستخدام الخاصة بك. يرجى مراجعة خطتك وتفاصيل الفوترة في Google AI Studio.");
                    }
                     return new Error(`[${status || 'خطأ في الواجهة'}] ${message || 'حدث خطأ غير معروف في واجهة برمجة التطبيقات.'}`);
                }
            } catch (e) {
                // Parsing failed, fall through to return original message
            }
        }
        return new Error(`حدث خطأ أثناء ${context}: ${error.message}`);
    }
    return new Error(`حدث خطأ غير معروف أثناء ${context}.`);
};


export const getApiKey = (): string => {
    const userKey = apiKeyService.getApiKey();
    if (userKey) {
        return userKey;
    }
    const envKey = process.env.API_KEY;
    if (envKey) {
        return envKey;
    }
    throw new Error("لم يتم العثور على مفتاح API. يرجى إضافته في صفحة الإعدادات للمتابعة.");
};

const getAiInstance = (): GoogleGenAI => {
    const apiKey = getApiKey();
    return new GoogleGenAI({ apiKey });
};

export const runQuery = async (conversationHistory: ChatMessage[]): Promise<{ text: string; debugInfo: DebugInfo }> => {
  const startTime = Date.now();
  const model = 'gemini-2.5-flash';
  
  try {
    const ai = getAiInstance();
    
    const formattedContents: Content[] = conversationHistory
      .filter(msg => (msg.role === ChatRole.User || msg.role === ChatRole.Model) && msg.id !== 'init')
      .map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: msg.parts.map(part => {
          if (part.type === 'image') {
            return { inlineData: { mimeType: part.mimeType, data: part.data } };
          }
          return { text: part.text };
        })
      }));

    if (formattedContents.length === 0) {
        return { text: "لا يمكن إرسال رسالة فارغة.", debugInfo: { responseTimeMs: 0, model } };
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: formattedContents,
      config: {
        systemInstruction: "أنت مساعد ذكاء اصطناعي ودود ومبدع يُدعى 'حمزة سوبر بلس'. يجب أن تكون إجاباتك دقيقة ومفصلة ومفيدة. استخدم الرموز التعبيرية (الإيموجي) بشكل مناسب لإضفاء طابع ودي وجذاب على المحادثة. تصرف بأسلوب مشابه لـ ChatGPT. يمكنك أيضًا تنفيذ مهام مثل 'انشئ صورة لـ...' أو 'صمم موقع ويب عن...'.",
      },
    });
    
    const endTime = Date.now();
    const debugInfo: DebugInfo = {
      responseTimeMs: endTime - startTime,
      model: model,
      totalTokens: response.usageMetadata?.totalTokenCount,
    };

    return { text: response.text, debugInfo };

  } catch (error) {
     const apiError = handleApiError(error, "الاتصال بـ Gemini API");
     const endTime = Date.now();
     const debugInfo: DebugInfo = {
        responseTimeMs: endTime - startTime,
        model: model,
     };
     return { text: apiError.message, debugInfo };
  }
};

// FIX: Add a new function to handle messenger queries with custom personalities.
export const runMessengerQuery = async (
  contents: Content[],
  systemInstruction: string
): Promise<string> => {
    try {
        const ai = getAiInstance();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        const apiError = handleApiError(error, "إرسال رسالة إلى الصديق");
        return apiError.message;
    }
};


export const checkApiKeyStatus = async (): Promise<{ success: boolean; message: string; }> => {
    try {
        getApiKey(); // Check if key exists first
        const ai = getAiInstance();
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'hello',
            config: {
                maxOutputTokens: 5,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return { success: true, message: 'مفتاح API صالح ويعمل بشكل صحيح.' };
    } catch (error) {
        const apiError = handleApiError(error, 'التحقق من مفتاح API');
        return { success: false, message: `فشل التحقق: ${apiError.message}` };
    }
};

type AspectRatio = "1:1" | "9:16" | "16:9" | "4:3" | "3:4";

const getEnhancedImagePrompt = (prompt: string): string => {
    const enhancements = "photorealistic, hyperrealistic, 8k, ultra-detailed, professional photography, sharp focus, high quality, masterpiece";
    return `${prompt}, ${enhancements}. Strictly adhere to the core subject of the user's prompt.`;
};

const getEnhancedVideoPrompt = (prompt: string): string => {
    const enhancements = "cinematic, 4k, high quality, professional video, dramatic lighting, vivid colors, epic";
    const watermark = `Add a small, semi-transparent text watermark in the bottom-right corner of the video that says "حمزة سوبر".`;
    return `${prompt}, ${enhancements}. ${watermark}. Strictly adhere to the core subject of the user's prompt.`;
};

export const generateImages = async (
  prompt: string,
  numberOfImages: number,
  aspectRatio: AspectRatio
): Promise<string[]> => {
  try {
    const ai = getAiInstance();
    const response: GenerateImagesResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: getEnhancedImagePrompt(prompt),
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    const images: string[] = response.generatedImages.map(img => {
      const base64ImageBytes: string = img.image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    });
    return images;

  } catch (error) {
    throw handleApiError(error, "توليد الصور");
  }
};

export const generateVideo = async (prompt: string): Promise<any> => {
  try {
    const ai = getAiInstance();
    const operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: getEnhancedVideoPrompt(prompt),
      config: {
        numberOfVideos: 1,
      },
    });
    return operation;
  } catch (error) {
    throw handleApiError(error, "بدء توليد الفيديو");
  }
};

export const getVideoOperationStatus = async (operation: any): Promise<any> => {
  try {
    const ai = getAiInstance();
    const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
    return updatedOperation;
  } catch (error) {
    throw handleApiError(error, "التحقق من حالة الفيديو");
  }
};

export type WebTechStack = 'html-css' | 'tailwind' | 'react-tailwind';

const getWebsiteSystemInstruction = (techStack: WebTechStack): string => {
  switch (techStack) {
    case 'tailwind':
      return "You are an expert web developer. Create a complete, professional, single-file HTML website. It MUST use Tailwind CSS via the official CDN script (`<script src=\"https://cdn.tailwindcss.com\"></script>`). All styling must be done with Tailwind utility classes. The code should be well-formatted, responsive, and ready to be used directly. The output must be only the HTML code, with no explanations or markdown formatting outside the HTML itself.";
    case 'react-tailwind':
      return "You are an expert React developer. Create a single, complete JSX component file for a web page. The component should be self-contained and use Tailwind CSS for all styling. Assume the user has a React project set up with Tailwind CSS configured. Do not include `<html>` or `<body>` tags. The output must be only the JSX code for the main component, with no explanations or markdown formatting outside the code itself.";
    case 'html-css':
    default:
      return "You are an expert web developer. Create a complete, professional, single-file HTML website with inline CSS inside a `<style>` tag. The code should be well-formatted, responsive, and ready to be used directly. Do not include any explanations or markdown formatting outside of the HTML code itself. The output must be only the HTML code.";
  }
};

export const generateWebsite = async (prompt: string, techStack: WebTechStack): Promise<string> => {
  try {
    const ai = getAiInstance();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a complete, single-file website based on this prompt: "${prompt}"`,
      config: {
        systemInstruction: getWebsiteSystemInstruction(techStack),
        responseMimeType: "text/plain",
      },
    });
    const code = response.text.replace(/```(html|jsx|javascript)\n|```/g, '').trim();
    return code;
  } catch (error) {
    throw handleApiError(error, "توليد الموقع");
  }
};

export const generateBookContent = async (topic: string): Promise<BookContent> => {
    try {
        const ai = getAiInstance();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a short, non-fiction book about the following topic: "${topic}". The book should have a clear title, a search query for a stock photo website to find a suitable cover image, and at least 3 chapters. Each chapter should have a title and a few paragraphs of content.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "The title of the book." },
                        cover_query: { type: Type.STRING, description: "A concise search query for a stock photo website (like Unsplash) to find a suitable cover image." },
                        chapters: {
                            type: Type.ARRAY,
                            description: "An array of chapters, each with a title and content.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "The title of the chapter." },
                                    content: { type: Type.STRING, description: "The content of the chapter, written in paragraphs." }
                                },
                            }
                        }
                    },
                },
            },
        });
        
        const jsonString = response.text.trim();
        const bookContent: BookContent = JSON.parse(jsonString);
        return bookContent;

    } catch (error) {
        throw handleApiError(error, "توليد محتوى الكتاب");
    }
};