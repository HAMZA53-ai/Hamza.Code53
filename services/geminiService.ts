import { GoogleGenAI, GenerateContentResponse, GenerateImagesResponse, Type, Content, Modality } from "@google/genai";
import { ChatMessage, ChatRole, DebugInfo, QuizQuestion, QuizType, Slide, WebTechStack } from "../types";
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

const getWebsiteSystemInstruction = (techStack: WebTechStack, language: string): string => {
  const langCode = language.split(' ')[0].toLowerCase();
  const languageDirection = ['Arabic', 'Hebrew', 'Persian', 'Urdu'].includes(language) ? 'rtl' : 'ltr';
  const htmlTag = `<html lang="${langCode}" dir="${languageDirection}">`;

  const commonInstructions = `
You are an expert web developer with a powerful "Smart Layout Engine". Your task is to generate a COMPLETE, SINGLE-FILE website based on the user's prompt, making intelligent decisions about the structure.

**Step 1: Analyze the User's Request**
First, determine the TYPE of website the user wants:
  A) A **Standard Website** (e.g., for a business, portfolio, restaurant, marketing page).
  B) A **Complex Application Simulation** (e.g., "a page like Facebook", "a Trello dashboard", "a Twitter feed").

**Step 2: Choose the Correct Structure based on your analysis**

**IF Type A (Standard Website):**
You MUST build a professional, multi-section website with the following components in order:
*   A sticky/fixed navigation bar (Header).
*   A compelling "Hero" section.
*   A "Features" or "Services" section.
*   An "About Us" section.
*   A "Testimonials" section.
*   A "Contact Us" form.
*   A "Footer".
This structure is proven and effective for business and portfolio sites.

**IF Type B (Complex Application Simulation):**
You MUST **IGNORE** the standard structure above. Instead, you must create a custom layout that accurately mimics the requested application.
*   **Deconstruct the UI:** Think like a UI/UX designer. Break down the application into its core components (e.g., for Facebook: a left sidebar for navigation, a central news feed with post cards, a right sidebar for contacts).
*   **Build the Layout:** Use divs and CSS (or Tailwind classes) to create the necessary multi-column layout.
*   **Create Components:** Populate the layout with placeholder components that look like the real application (e.g., create styled divs for posts, each with a user avatar, name, text content, and like/comment buttons).
*   **Focus on Fidelity:** The goal is to create a high-fidelity, non-functional prototype that visually represents the user's request.

**CRITICAL REQUIREMENTS FOR BOTH TYPES:**

1.  **Content Language:** ALL text content (headings, paragraphs, button text, form labels, etc.) MUST be written in **${language}**.

2.  **SEO & Accessibility:**
    *   The HTML MUST include a relevant and descriptive \`<title>\` tag in the \`<head>\`. The title must be in **${language}**.
    *   The HTML MUST include a relevant \`<meta name="description" content="...">\` tag in the \`<head>\`. The content must be in **${language}**.
    *   ALL \`<img>\` tags MUST have a descriptive \`alt\` attribute. The alt text should also be in **${language}**.
    *   Use semantic HTML5 tags like \`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<footer>\`. For complex layouts, use \`<div>\` with appropriate class names or ARIA roles.

3.  **Images:** Use high-quality, professional placeholder images from picsum.photos. Use different, descriptive seeds for different images to ensure variety (e.g., seed/hero, seed/avatar1, seed/post_image, etc.).

4.  **Output Format:** The final output MUST BE ONLY THE CODE. Do not include any explanations, comments, or markdown formatting (like \`\`\`html) outside the code itself. The code must be clean, well-formatted, and ready for production.
`;

  switch (techStack) {
    case 'tailwind':
      return `${commonInstructions}
**Technology Stack:**
*   Create a single HTML file.
*   It MUST use Tailwind CSS for all styling.
*   It MUST include the official Tailwind CSS CDN script in the \`<head>\`: \`<script src="https://cdn.tailwindcss.com"></script>\`.
*   The root element MUST be \`${htmlTag}\`.
`;
    case 'react-tailwind':
      return `You are an expert React developer with a powerful "Smart Layout Engine". Create a single, complete JSX component file for a web page. Assume the user has a React project set up with Tailwind CSS configured. Do not include \`<html>\` or \`<body>\` tags.

**Step 1: Analyze the User's Request**
First, determine the TYPE of page the user wants:
  A) A **Standard Website Page** (e.g., for a business, portfolio, restaurant).
  B) A **Complex Application Simulation** (e.g., "a component for a Facebook-like page", "a Trello dashboard").

**Step 2: Choose the Correct Structure**

**IF Type A (Standard Website Page):**
You MUST build a professional, multi-section component with a root \`<div>\` containing:
*   A sticky/fixed navigation bar (\`<header>\`).
*   A "Hero" section.
*   A "Features" or "Services" section.
*   An "About Us" section.
*   A "Testimonials" section.
*   A "Contact Us" form.
*   A "Footer" (\`<footer>\`).

**IF Type B (Complex Application Simulation):**
You MUST **IGNORE** the standard structure. Instead, create a custom layout that accurately mimics the requested application.
*   **Deconstruct the UI:** Break the application into its core components (e.g., for Facebook: a left sidebar, a central feed with post card components, a right sidebar).
*   **Build the Layout:** Use divs with Tailwind classes for multi-column layouts.
*   **Create Components:** Create placeholder components that look like the real application.

**CRITICAL REQUIREMENTS FOR BOTH TYPES:**

1.  **Content Language:** ALL text content MUST be in **${language}**.
2.  **Accessibility:** All \`<img>\` tags MUST have descriptive \`alt\` attributes in **${language}**.
3.  **Images:** Use placeholder images from picsum.photos. Use different seeds.
4.  **Output Format:** The output must be only the JSX code for the main component, with no explanations or markdown formatting. The component should be a default export.
`;
    case 'html-css':
    default:
      return `${commonInstructions}
**Technology Stack:**
*   Create a single HTML file.
*   All CSS styling MUST be contained within a single \`<style>\` tag in the \`<head>\`. Make the design modern and responsive.
*   The root element MUST be \`${htmlTag}\`.
`;
  }
};


export const generateWebsite = async (prompt: string, techStack: WebTechStack, language: string): Promise<string> => {
  try {
    const ai = getAiInstance();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a complete, single-file website based on this prompt: "${prompt}"`,
      config: {
        systemInstruction: getWebsiteSystemInstruction(techStack, language),
        responseMimeType: "text/plain",
      },
    });
    const code = response.text.replace(/```(html|jsx|javascript)\n|```/g, '').trim();
    return code;
  } catch (error) {
    throw handleApiError(error, "توليد الموقع");
  }
};

export const explainConcept = async (topic: string): Promise<string> => {
    try {
        const ai = getAiInstance();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Explain this concept: "${topic}"`,
            config: {
                systemInstruction: "You are an expert educator. Explain concepts in a clear, concise, and easy-to-understand way for a high school student. Use analogies, examples, and markdown for formatting.",
                responseMimeType: "text/plain",
            },
        });
        return response.text;
    } catch (error) {
        throw handleApiError(error, "شرح المفهوم");
    }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    try {
        const ai = getAiInstance();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text to ${targetLanguage}. Provide only the translated text: "${text}"`,
            config: {
                systemInstruction: "You are a professional translator. Provide only the translated text, without any additional comments or explanations.",
                responseMimeType: "text/plain",
            },
        });
        return response.text;
    } catch (error) {
        throw handleApiError(error, "ترجمة النص");
    }
};

export const summarizeText = async (text: string): Promise<string> => {
    try {
        const ai = getAiInstance();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize the following text in a few key points: "${text}"`,
            config: {
                systemInstruction: "You are an expert at summarizing long texts. Extract the main ideas and present them as a concise summary. Use bullet points if appropriate.",
                responseMimeType: "text/plain",
            },
        });
        return response.text;
    } catch (error) {
        throw handleApiError(error, "تلخيص النص");
    }
};

export const generateQuiz = async (text: string, type: QuizType, count: number): Promise<QuizQuestion[]> => {
    try {
        const ai = getAiInstance();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a quiz with ${count} questions of type '${type}' based on the following text. Ensure the questions are relevant and cover the main points of the text. For multiple-choice questions, provide 4 options.

            Text: """
            ${text}
            """`,
            config: {
                systemInstruction: "You are an AI assistant designed to create educational quizzes. Generate high-quality questions based on the provided text and return the output in the specified JSON format. The answer for multiple-choice questions must be one of the provided options.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: 'An array of 4 potential answers for multiple-choice questions.',
                                nullable: true
                            },
                            answer: { type: Type.STRING }
                        },
                        required: ['question', 'answer']
                    }
                }
            }
        });

        // The response text is a JSON string, parse it.
        const jsonString = response.text.trim();
        const quizData: QuizQuestion[] = JSON.parse(jsonString);
        return quizData;

    } catch (error) {
        throw handleApiError(error, "توليد الاختبار");
    }
};

// ADD: Generic text tool function
export const generateTextForTool = async (prompt: string, systemInstruction: string): Promise<string> => {
  try {
    const ai = getAiInstance();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    throw handleApiError(error, "توليد نص مخصص");
  }
};

// ADD: Slides generation function
export const generateSlides = async (topic: string): Promise<Slide[]> => {
    try {
        const ai = getAiInstance();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a concise and informative slide presentation on the topic: "${topic}". Generate 5 to 7 slides.`,
            config: {
                systemInstruction: "You are an expert at creating slide presentations. For each slide, provide a short title and 3-5 bullet points as a single string with each point starting with a hyphen.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            content: { type: Type.STRING, description: "A single string containing bullet points, each starting with '-' and separated by newlines." }
                        },
                        required: ['title', 'content']
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        throw handleApiError(error, "توليد العروض التقديمية");
    }
};

// FIX: Overhaul image editing function with robust error handling.
export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = getAiInstance();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        // Check for prompt feedback first, which indicates an issue before generation.
        if (response.promptFeedback?.blockReason) {
             throw new Error(`تم حظر الطلب بسبب سياسات السلامة (السبب: ${response.promptFeedback.blockReason}). يرجى تعديل الصورة أو الوصف.`);
        }
        
        const candidate = response.candidates?.[0];

        if (!candidate) {
             throw new Error("لم يتم تلقي أي استجابة صالحة من النموذج.");
        }
        
        // Check for finish reason on the candidate
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            // Provide a more user-friendly message for SAFETY
            if (candidate.finishReason === 'SAFETY') {
                 throw new Error(`تعذر تعديل الصورة لأنها تنتهك سياسات السلامة. يرجى تجربة صورة أو وصف مختلف.`);
            }
            throw new Error(`فشل إنشاء الصورة. السبب: ${candidate.finishReason}.`);
        }

        const imagePart = candidate.content?.parts?.find(p => p.inlineData);

        if (imagePart?.inlineData?.data) {
            return imagePart.inlineData.data;
        }
        
        const textPart = candidate.content?.parts?.find(p => p.text);
        if (textPart?.text) {
            throw new Error(`لم يتم إرجاع صورة. رد النموذج: "${textPart.text}"`);
        }
        
        throw new Error("لم يتم العثور على صورة في استجابة النموذج. قد تكون الاستجابة فارغة أو غير متوقعة.");

    } catch (error) {
        // Updated to catch all our new specific error messages
        if (error instanceof Error && (
            error.message.includes('سياسات السلامة') || 
            error.message.includes('فشل إنشاء الصورة') || 
            error.message.includes('لم يتم إرجاع صورة') || 
            error.message.includes('لم يتم العثور على صورة') ||
            error.message.includes('لم يتم تلقي أي استجابة')
        )) {
            throw error;
        }
        throw handleApiError(error, "تحرير الصورة");
    }
};

// ADD: Logo generation function
export const generateLogo = async (prompt: string, style: string): Promise<string[]> => {
    const fullPrompt = `${style} logo for ${prompt}, vector, simple, on a clean white background`;
    try {
        const ai = getAiInstance();
        const response: GenerateImagesResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 4,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
    } catch (error) {
        throw handleApiError(error, "توليد الشعارات");
    }
};