
import { GoogleGenAI, GenerateContentResponse, GenerateImagesResponse, Type, Content, Modality } from "@google/genai";
// FIX: Import VideoAnalysisResult type.
import { ChatMessage, ChatRole, DebugInfo, QuizQuestion, QuizType, Slide, WebTechStack, MessagePart, ChatMode, VideoAnalysisResult } from "../types";

// --- Generic Error Handling ---
const handleApiError = (error: unknown, context: string): Error => {
    console.error(`AI Service Error (${context}):`, error);
    if (error instanceof Error) {
        if (error.message.includes('API is only accessible to billed users')) {
            return new Error("للاستفادة من ميزات توليد الصور والفيديو، يجب أن يكون حساب Google Cloud الخاص بك مفوترًا. يرجى تفعيل الفوترة في مشروعك على Google Cloud ثم المحاولة مرة أخرى.");
        }
        if (error.message.includes('API key not valid')) {
            return new Error("مفتاح API غير صالح. يرجى التحقق منه في صفحة الإعدادات.");
        }
        
        if (error.message.includes('Insufficient Balance')) {
            return new Error("لقد تجاوزت حصة الاستخدام الخاصة بك. يرجى مراجعة خطتك وتفاصيل الفوترة لدى مزود الخدمة.");
        }

        if (error.message.includes('{') && error.message.includes('}')) {
            try {
                const jsonString = error.message.substring(error.message.indexOf('{'));
                const errorDetails = JSON.parse(jsonString);
                
                if (errorDetails.error) {
                    const { message, status, code } = errorDetails.error;
                    if (status === 'RESOURCE_EXHAUSTED' || code === 'insufficient_quota') {
                        return new Error("لقد تجاوزت حصة الاستخدام الخاصة بك. يرجى مراجعة خطتك وتفاصيل الفوترة لدى مزود الخدمة.");
                    }
                     return new Error(`[${status || code || 'خطأ في الواجهة'}] ${message || 'حدث خطأ غير معروف في واجهة برمجة التطبيقات.'}`);
                }
            } catch (e) {
                // Parsing failed, fall through
            }
        }
        return new Error(`حدث خطأ أثناء ${context}: ${error.message}`);
    }
    return new Error(`حدث خطأ غير معروف أثناء ${context}.`);
};

// --- Gemini Implementation ---
const getGeminiInstance = (): GoogleGenAI => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("لم يتم تكوين مفتاح Google Gemini API. يرجى الاتصال بمسؤول التطبيق.");
    }
    return new GoogleGenAI({ apiKey });
};

const runGeminiQuery = async (
    conversationHistory: ChatMessage[],
    chatMode: ChatMode
): Promise<{ text: string; debugInfo: DebugInfo; sources?: { title: string; uri: string }[] }> => {
  const startTime = Date.now();
  const model = 'gemini-2.5-flash';
  
  const ai = getGeminiInstance();
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
      throw new Error("لا يمكن إرسال رسالة فارغة.");
  }

  const config: any = { };

  switch (chatMode) {
    case 'google_search':
      config.tools = [{googleSearch: {}}];
      config.systemInstruction = "You are a helpful AI assistant called 'MZ'. Your main language is Arabic. When using Google Search, you MUST cite your sources. Format citations at the end of your answer. You are not a JSON endpoint.";
      break;
    case 'quick_response':
      config.thinkingConfig = { thinkingBudget: 0 };
      config.systemInstruction = "You are 'MZ'. Provide quick, concise, and direct answers in Arabic. Be brief. Use emojis where appropriate.";
      break;
    case 'learning':
      config.systemInstruction = "You are 'MZ' in learning mode. The user is providing you with information to remember for this conversation. Acknowledge that you have received the information and will remember it. Briefly confirm what you've learned in one sentence, in Arabic.";
      break;
    default:
      config.systemInstruction = "أنت مساعد ذكاء اصطناعي ودود ومبدع يُدعى 'MZ'. يجب أن تكون إجاباتك دقيقة ومفصلة ومفيدة باللغة العربية. استخدم الرموز التعبيرية (الإيموجي) بشكل مناسب لإضفاء طابع ودي وجذاب على المحادثة. تصرف بأسلوب مشابه لـ ChatGPT.";
  }


  const response: GenerateContentResponse = await ai.models.generateContent({
    model: model,
    contents: formattedContents,
    config: config,
  });
  
  const endTime = Date.now();
  const debugInfo: DebugInfo = {
    responseTimeMs: endTime - startTime,
    provider: 'Gemini',
    model: model,
    totalTokens: response.usageMetadata?.totalTokenCount,
  };

  let responseText = response.text;
  let sources;

  if (chatMode === 'google_search' && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      const uniqueSources = new Map<string, { title: string; uri: string }>();
      chunks
          .map((chunk: any) => chunk.web)
          .filter((web: any) => web && web.uri && web.title)
          .forEach((web: any) => {
              if (!uniqueSources.has(web.uri)) {
                  uniqueSources.set(web.uri, { title: web.title, uri: web.uri });
              }
          });
      
      sources = Array.from(uniqueSources.values());
      
      if (sources.length > 0) {
          const sourceLinks = sources.map(source => `[${source.title}](${source.uri})`).join('\n');
          responseText += `\n\n**المصادر:**\n${sourceLinks}`;
      }
  }


  return { text: responseText, debugInfo, sources };
};


// --- Public Facade Functions ---

export const runQuery = async (
    conversationHistory: ChatMessage[],
    chatMode: ChatMode
): Promise<{ text: string; debugInfo: DebugInfo; sources?: { title: string; uri: string }[] }> => {
    try {
        return await runGeminiQuery(conversationHistory, chatMode);
    } catch (error) {
        throw handleApiError(error, "تشغيل الاستعلام");
    }
};

// --- Gemini-Exclusive Functions ---

type AspectRatio = "1:1" | "9:16" | "16:9" | "4:3" | "3:4";

const getEnhancedImagePrompt = (prompt: string): string => {
    const enhancements = "photorealistic, hyperrealistic, 8k, ultra-detailed, professional photography, sharp focus, high quality, masterpiece";
    return `${prompt}, ${enhancements}. Strictly adhere to the core subject of the user's prompt.`;
};

export const generateImages = async (
  prompt: string,
  numberOfImages: number,
  aspectRatio: AspectRatio
): Promise<string[]> => {
  try {
    const ai = getGeminiInstance();
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

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = getGeminiInstance();
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

        if (response.promptFeedback?.blockReason) {
             throw new Error(`تم حظر الطلب بسبب سياسات السلامة (السبب: ${response.promptFeedback.blockReason}). يرجى تعديل الصورة أو الوصف.`);
        }
        
        const candidate = response.candidates?.[0];

        if (!candidate) {
             throw new Error("لم يتم تلقي أي استجابة صالحة من النموذج.");
        }
        
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
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

export const generateLogo = async (prompt: string, style: string): Promise<string[]> => {
    const fullPrompt = `${style} logo for ${prompt}, vector, simple, on a clean white background`;
    try {
        const ai = getGeminiInstance();
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

export const generateVideo = async (prompt: string): Promise<any> => {
    try {
        const ai = getGeminiInstance();
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        throw handleApiError(error, "توليد الفيديو");
    }
};

export const getVideoOperationStatus = async (operation: any): Promise<any> => {
    try {
        const ai = getGeminiInstance();
        const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
        return updatedOperation;
    } catch (error) {
        throw handleApiError(error, "الحصول على حالة عملية الفيديو");
    }
};


// --- Provider-Agnostic Text-Based Functions ---

const runTextGeneration = async (contents: MessagePart[], systemInstruction: string, jsonSchema?: any): Promise<string> => {
    try {
        const ai = getGeminiInstance();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { role: 'user', parts: contents.map(p => p.type === 'text' ? { text: p.text } : { inlineData: { data: p.data, mimeType: p.mimeType } }) },
          config: {
            systemInstruction: systemInstruction,
            ...(jsonSchema && { responseMimeType: "application/json", responseSchema: jsonSchema })
          },
        });
        return response.text;
    } catch(error) {
        throw handleApiError(error, "توليد نص");
    }
};


export const generateWebsite = async (prompt: string, techStack: WebTechStack, language: string): Promise<string> => {
    const systemInstruction = getWebsiteSystemInstruction(techStack, language);
    const code = await runTextGeneration([{type: 'text', text: `Generate a complete, single-file website based on this prompt: "${prompt}"`}], systemInstruction);
    return code.replace(/```(html|jsx|javascript)\n|```/g, '').trim();
};

export const explainConcept = (topic: string) => runTextGeneration(
    [{ type: 'text', text: `Explain this concept: "${topic}"` }],
    "You are an expert educator. Explain concepts in a clear, concise, and easy-to-understand way for a high school student. Use analogies, examples, and markdown for formatting."
);

export const translateText = (text: string, targetLanguage: string) => runTextGeneration(
    [{ type: 'text', text: `Translate the following text to ${targetLanguage}. Provide only the translated text: "${text}"` }],
    "You are a professional translator. Provide only the translated text, without any additional comments or explanations."
);

export const summarizeText = (text: string) => runTextGeneration(
    [{ type: 'text', text: `Summarize the following text in a few key points: "${text}"` }],
    "You are an expert at summarizing long texts. Extract the main ideas and present them as a concise summary. Use bullet points if appropriate."
);

export const generateQuiz = async (text: string, type: QuizType, count: number): Promise<QuizQuestion[]> => {
    const jsonString = await runTextGeneration(
        [{ type: 'text', text: `Generate a quiz with ${count} questions of type '${type}' based on the following text. Ensure the questions are relevant and cover the main points of the text. For multiple-choice questions, provide 4 options. Text: """${text}"""` }],
        "You are an AI assistant designed to create educational quizzes. Generate high-quality questions based on the provided text and return the output in the specified JSON format. The answer for multiple-choice questions must be one of the provided options.",
        {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of 4 potential answers for multiple-choice questions.', nullable: true },
                    answer: { type: Type.STRING }
                },
                required: ['question', 'answer']
            }
        }
    );
    return JSON.parse(jsonString.trim());
};

export const generateTextForTool = async (prompt: string, systemInstruction: string): Promise<string> => {
    return await runTextGeneration([{ type: 'text', text: prompt }], systemInstruction);
};

export const generateSlides = async (topic: string): Promise<Slide[]> => {
    const jsonString = await runTextGeneration(
        [{ type: 'text', text: `Create a concise and informative slide presentation on the topic: "${topic}". Generate 5 to 7 slides.` }],
        "You are an expert at creating slide presentations. For each slide, provide a short title and 3-5 bullet points as a single string with each point starting with a hyphen.",
        {
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
    );
    return JSON.parse(jsonString.trim());
};

// FIX: Add summarizeAndQuizVideo function for video analysis.
export const summarizeAndQuizVideo = async (videoUrl: string): Promise<VideoAnalysisResult> => {
    const jsonString = await runTextGeneration(
        [{ type: 'text', text: `Analyze the video from this URL: ${videoUrl}. Provide a concise summary of its content and then generate a 5-question multiple-choice quiz based on the video's key points. The video is likely a YouTube video.` }],
        "You are an AI assistant specialized in analyzing video content from URLs. You will provide a summary and a quiz in the specified JSON format. Your capabilities for analyzing videos are experimental and may rely on transcriptions or other available metadata.",
        {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING, description: "A concise summary of the video content." },
                quiz: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of 4 potential answers.' },
                            answer: { type: Type.STRING }
                        },
                        required: ['question', 'options', 'answer']
                    }
                }
            },
            required: ['summary', 'quiz']
        }
    );
    return JSON.parse(jsonString.trim());
};


// --- Helper for Website Generator ---
const getWebsiteSystemInstruction = (techStack: WebTechStack, language: string): string => {
  const langCodeMapping: { [key: string]: string } = {
    'Arabic': 'ar', 'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de', 'Japanese': 'ja', 'Chinese': 'zh', 'Russian': 'ru'
  };
  const langCode = langCodeMapping[language] || 'en';
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

1.  **Content Language:** ALL text content (headings, paragraphs, button text, form labels, etc.) MUST be in **${language}**.

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
