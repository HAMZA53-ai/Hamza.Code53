

import { GoogleGenAI, GenerateContentResponse, GenerateImagesResponse, Type, Content, Modality } from "@google/genai";
import { ChatMessage, ChatRole, DebugInfo, QuizQuestion, QuizType, Slide, WebTechStack, MessagePart, ChatMode, VideoAnalysisResult } from "../types";
import { getGeminiApiKey } from './apiKeyService';

// --- إدارة مركزية لمفتاح API ---
export const getActiveApiKey = (): string | null => {
    const userKey = getGeminiApiKey();
    if (userKey) {
        return userKey;
    }
    return process.env.API_KEY || null;
}

// --- معالجة الأخطاء العامة ---
const handleApiError = (error: unknown, context: string): Error => {
    console.error(`خطأ في خدمة الذكاء الاصطناعي (${context}):`, error);
    if (error instanceof Error) {
        if (error.message.includes('API is only accessible to billed users')) {
            return new Error("للاستفادة من ميزات توليد الصور والفيديو، يجب أن يكون حساب Google Cloud الخاص بك مفوترًا. يرجى تفعيل الفوترة في مشروعك على Google Cloud ثم المحاولة مرة أخرى.");
        }
        if (error.message.includes('API key not valid')) {
            return new Error("مفتاح API غير صالح. يرجى التحقق منه في صفحة الإعدادات أو استخدام زر التفعيل المجاني.");
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
                // فشل التحليل، استمر
            }
        }
        return new Error(`حدث خطأ أثناء ${context}: ${error.message}`);
    }
    return new Error(`حدث خطأ غير معروف أثناء ${context}.`);
};

// --- تطبيق Gemini ---
const getGeminiInstance = (): GoogleGenAI => {
    const apiKey = getActiveApiKey();
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
      config.systemInstruction = "أنت مساعد ذكاء اصطناعي مفيد يُدعى 'MZ'. لغتك الأساسية هي العربية. عند استخدام بحث جوجل، يجب عليك ذكر مصادرك. قم بتنسيق الاقتباسات في نهاية إجابتك. أنت لست نقطة نهاية JSON.";
      break;
    case 'quick_response':
      config.thinkingConfig = { thinkingBudget: 0 };
      config.systemInstruction = "أنت 'MZ'. قدم إجابات سريعة وموجزة ومباشرة باللغة العربية. كن مختصرًا. استخدم الرموز التعبيرية عند الاقتضاء.";
      break;
    case 'learning':
      config.systemInstruction = "أنت 'MZ' في وضع التعلم. يقوم المستخدم بتزويدك بمعلومات لتتذكرها في هذه المحادثة. أقر بأنك تلقيت المعلومات وسوف تتذكرها. قم بتأكيد ما تعلمته بإيجاز في جملة واحدة باللغة العربية.";
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


// --- وظائف الواجهة العامة ---

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

// --- وظائف حصرية لـ Gemini ---

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

export const generateVideo = async (prompt: string, image?: { data: string, mimeType: string }): Promise<any> => {
    try {
        const ai = getGeminiInstance();
        
        const requestPayload: any = {
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        };

        if (image) {
            requestPayload.image = {
                imageBytes: image.data,
                mimeType: image.mimeType
            };
        }

        const operation = await ai.models.generateVideos(requestPayload);
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


// --- وظائف نصية مستقلة عن المزود ---

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
    "أنت معلم خبير. اشرح المفاهيم بطريقة واضحة وموجزة وسهلة الفهم لطالب في المدرسة الثانوية. استخدم التشبيهات والأمثلة وتنسيق markdown."
);

export const translateText = (text: string, targetLanguage: string) => runTextGeneration(
    [{ type: 'text', text: `Translate the following text to ${targetLanguage}. Provide only the translated text: "${text}"` }],
    "أنت مترجم محترف. قدم النص المترجم فقط، دون أي تعليقات أو شروحات إضافية."
);

export const summarizeText = (text: string) => runTextGeneration(
    [{ type: 'text', text: `Summarize the following text in a few key points: "${text}"` }],
    "أنت خبير في تلخيص النصوص الطويلة. استخرج الأفكار الرئيسية وقدمها كملخص موجز. استخدم النقاط إذا كان ذلك مناسبًا."
);

export const generateQuiz = async (text: string, type: QuizType, count: number): Promise<QuizQuestion[]> => {
    const jsonString = await runTextGeneration(
        [{ type: 'text', text: `Generate a quiz with ${count} questions of type '${type}' based on the following text. Ensure the questions are relevant and cover the main points of the text. For multiple-choice questions, provide 4 options. Text: """${text}"""` }],
        "أنت مساعد ذكاء اصطناعي مصمم لإنشاء اختبارات تعليمية. قم بإنشاء أسئلة عالية الجودة بناءً على النص المقدم وأرجع الإخراج بتنسيق JSON المحدد. يجب أن يكون الجواب للأسئلة متعددة الخيارات أحد الخيارات المقدمة.",
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
        "أنت خبير في إنشاء العروض التقديمية. لكل شريحة، قدم عنوانًا قصيرًا و 3-5 نقاط كنص واحد مع بدء كل نقطة بشرطة.",
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

export const summarizeAndQuizVideo = async (videoUrl: string): Promise<VideoAnalysisResult> => {
    const jsonString = await runTextGeneration(
        [{ type: 'text', text: `Analyze the video from this URL: ${videoUrl}. Provide a concise summary of its content in Arabic and then generate a 5-question multiple-choice quiz in Arabic based on the video's key points. The video is likely a YouTube video. If you cannot access the video content, you MUST report an error and not invent information.` }],
        "أنت مساعد ذكاء اصطناعي متخصص في تحليل محتوى الفيديو من الروابط. ستقدم ملخصًا واختبارًا باللغة العربية، بتنسيق JSON المحدد. قدراتك على تحليل الفيديو تجريبية؛ إذا لم تتمكن من الوصول إلى المحتوى، يجب عليك الإبلاغ عن خطأ وعدم اختلاق معلومات. لا تخترع محتوى.",
        {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING, description: "ملخص موجز لمحتوى الفيديو باللغة العربية." },
                quiz: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING, description: "سؤال الاختبار باللغة العربية." },
                            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'مصفوفة من 4 إجابات محتملة باللغة العربية.' },
                            answer: { type: Type.STRING, description: "الإجابة الصحيحة باللغة العربية." }
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


// --- مساعد لمولد المواقع ---
const getWebsiteSystemInstruction = (techStack: WebTechStack, language: string): string => {
  const langCodeMapping: { [key: string]: string } = {
    'Arabic': 'ar', 'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de', 'Japanese': 'ja', 'Chinese': 'zh', 'Russian': 'ru'
  };
  const langCode = langCodeMapping[language] || 'en';
  const languageDirection = ['Arabic', 'Hebrew', 'Persian', 'Urdu'].includes(language) ? 'rtl' : 'ltr';
  const htmlTag = `<html lang="${langCode}" dir="${languageDirection}">`;

  const commonInstructions = `
أنت مطور ويب خبير تمتلك "محرك تخطيط ذكي" قوي. مهمتك هي إنشاء موقع ويب كامل في ملف واحد بناءً على طلب المستخدم، مع اتخاذ قرارات ذكية بشأن الهيكل.

**الخطوة 1: تحليل طلب المستخدم**
أولاً، حدد نوع موقع الويب الذي يريده المستخدم:
  أ) **موقع ويب قياسي** (على سبيل المثال، لشركة، معرض أعمال، مطعم، صفحة تسويق).
  ب) **محاكاة تطبيق معقد** (على سبيل المثال، "صفحة مثل فيسبوك"، "لوحة تحكم تريلو"، "صفحة تحديثات تويتر").

**الخطوة 2: اختر الهيكل الصحيح بناءً على تحليلك**

**إذا كان النوع أ (موقع ويب قياسي):**
يجب عليك بناء موقع ويب احترافي متعدد الأقسام بالمكونات التالية بالترتيب:
*   شريط تنقل ثابت (Header).
*   قسم رئيسي جذاب (Hero Section).
*   قسم "الميزات" أو "الخدمات".
*   قسم "من نحن".
*   قسم "آراء العملاء".
*   نموذج "اتصل بنا".
*   "تذييل" (Footer).
هذا الهيكل مثبت وفعال لمواقع الشركات ومعارض الأعمال.

**إذا كان النوع ب (محاكاة تطبيق معقد):**
يجب عليك **تجاهل** الهيكل القياسي أعلاه. بدلاً من ذلك، يجب عليك إنشاء تخطيط مخصص يحاكي بدقة التطبيق المطلوب.
*   **تفكيك واجهة المستخدم:** فكر كمصمم واجهات مستخدم/تجربة مستخدم. قم بتقسيم التطبيق إلى مكوناته الأساسية (على سبيل المثال، لفيسبوك: شريط جانبي أيسر للتنقل، قسم أخبار مركزي مع بطاقات للمنشورات، شريط جانبي أيمن لجهات الاتصال).
*   **بناء التخطيط:** استخدم عناصر div و CSS (أو كلاسات Tailwind) لإنشاء التخطيط متعدد الأعمدة اللازم.
*   **إنشاء المكونات:** املأ التخطيط بمكونات وهمية تشبه التطبيق الحقيقي (على سبيل المثال، أنشئ عناصر div منسقة للمنشورات، كل منها يحتوي على صورة رمزية للمستخدم، اسم، محتوى نصي، وأزرار إعجاب/تعليق).
*   **التركيز على الدقة:** الهدف هو إنشاء نموذج أولي عالي الدقة وغير وظيفي يمثل بصريًا طلب المستخدم.

**متطلبات حاسمة لكلا النوعين:**

1.  **لغة المحتوى:** يجب أن يكون كل المحتوى النصي (العناوين، الفقرات، نصوص الأزرار، تسميات النماذج، إلخ) باللغة **${language}**.

2.  **تحسين محركات البحث وإمكانية الوصول:**
    *   يجب أن يتضمن HTML وسم \`<title>\` ذا صلة ووصفي في \`<head>\`. يجب أن يكون العنوان باللغة **${language}**.
    *   يجب أن يتضمن HTML وسم \`<meta name="description" content="...">\` ذا صلة في \`<head>\`. يجب أن يكون المحتوى باللغة **${language}**.
    *   يجب أن تحتوي جميع وسوم \`<img>\` على سمة \`alt\` وصفية. يجب أن يكون النص البديل أيضًا باللغة **${language}**.
    *   استخدم وسوم HTML5 الدلالية مثل \`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<footer>\`. للتخطيطات المعقدة، استخدم \`<div>\` مع أسماء كلاسات مناسبة أو أدوار ARIA.

3.  **الصور:** استخدم صورًا وهمية عالية الجودة واحترافية من picsum.photos. استخدم "seeds" مختلفة ووصفية للصور المختلفة لضمان التنوع (على سبيل المثال، seed/hero, seed/avatar1, seed/post_image, إلخ).

4.  **تنسيق الإخراج:** يجب أن يكون الإخراج النهائي هو الكود فقط. لا تقم بتضمين أي شروحات أو تعليقات أو تنسيق markdown (مثل \`\`\`html) خارج الكود نفسه. يجب أن يكون الكود نظيفًا ومنسقًا جيدًا وجاهزًا للإنتاج.
`;

  switch (techStack) {
    case 'tailwind':
      return `${commonInstructions}
**مجموعة التقنيات:**
*   أنشئ ملف HTML واحد.
*   يجب أن يستخدم Tailwind CSS لجميع التنسيقات.
*   يجب أن يتضمن السكربت الرسمي لـ Tailwind CSS CDN في \`<head>\`: \`<script src="https://cdn.tailwindcss.com"></script>\`.
*   يجب أن يكون العنصر الجذري \`${htmlTag}\`.
`;
    case 'react-tailwind':
      return `أنت مطور React خبير تمتلك "محرك تخطيط ذكي" قوي. أنشئ ملف مكون JSX واحد وكامل لصفحة ويب. افترض أن المستخدم لديه مشروع React تم إعداده مع تكوين Tailwind CSS. لا تقم بتضمين وسوم \`<html>\` أو \`<body>\`.

**الخطوة 1: تحليل طلب المستخدم**
أولاً، حدد نوع الصفحة التي يريدها المستخدم:
  أ) **صفحة موقع ويب قياسية** (على سبيل المثال، لشركة، معرض أعمال، مطعم).
  ب) **محاكاة تطبيق معقد** (على سبيل المثال، "مكون لصفحة تشبه فيسبوك"، "لوحة تحكم تريلو").

**الخطوة 2: اختر الهيكل الصحيح**

**إذا كان النوع أ (صفحة موقع ويب قياسية):**
يجب عليك بناء مكون احترافي متعدد الأقسام مع عنصر \`<div>\` جذري يحتوي على:
*   شريط تنقل ثابت (\`<header>\`).
*   قسم رئيسي "Hero".
*   قسم "الميزات" أو "الخدمات".
*   قسم "من نحن".
*   قسم "آراء العملاء".
*   نموذج "اتصل بنا".
*   "تذييل" (\`<footer>\`).

**إذا كان النوع ب (محاكاة تطبيق معقد):**
يجب عليك **تجاهل** الهيكل القياسي. بدلاً من ذلك، أنشئ تخطيطًا مخصصًا يحاكي بدقة التطبيق المطلوب.
*   **تفكيك واجهة المستخدم:** قم بتقسيم التطبيق إلى مكوناته الأساسية (على سبيل المثال، لفيسبوك: شريط جانبي أيسر، قسم أخبار مركزي مع مكونات بطاقات للمنشورات، شريط جانبي أيمن).
*   **بناء التخطيط:** استخدم عناصر div مع كلاسات Tailwind للتخطيطات متعددة الأعمدة.
*   **إنشاء المكونات:** أنشئ مكونات وهمية تشبه التطبيق الحقيقي.

**متطلبات حاسمة لكلا النوعين:**

1.  **لغة المحتوى:** يجب أن يكون كل المحتوى النصي باللغة **${language}**.
2.  **إمكانية الوصول:** يجب أن تحتوي جميع وسوم \`<img>\` على سمات \`alt\` وصفية باللغة **${language}**.
3.  **الصور:** استخدم صورًا وهمية من picsum.photos. استخدم "seeds" مختلفة.
4.  **تنسيق الإخراج:** يجب أن يكون الإخراج هو كود JSX للمكون الرئيسي فقط، بدون شروحات أو تنسيق markdown. يجب أن يكون المكون تصديرًا افتراضيًا.
`;
    case 'html-css':
    default:
      return `${commonInstructions}
**مجموعة التقنيات:**
*   أنشئ ملف HTML واحد.
*   يجب أن يكون كل تنسيق CSS موجودًا داخل وسم \`<style>\` واحد في \`<head>\`. اجعل التصميم عصريًا ومتجاوبًا.
*   يجب أن يكون العنصر الجذري \`${htmlTag}\`.
`;
  }
};