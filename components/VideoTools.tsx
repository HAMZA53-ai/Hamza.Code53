import React, { useState } from 'react';
import Spinner from './Spinner';
import BackIcon from './icons/BackIcon';
import VideoIcon from './icons/VideoIcon';
import { generateTextForTool } from '../services/aiService';
import { marked } from 'marked';

type VideoToolTab = 'enhancer' | 'translation' | 'animation' | 'deepfake';

interface VideoToolsProps {
  onBack: () => void;
}

const toolDetails: Record<VideoToolTab, { title: string; systemInstruction: string; placeholder: string; buttonText: string; inputType: 'text' | 'textarea' }> = {
  enhancer: {
    title: 'تحسين جودة الفيديو',
    systemInstruction: 'You are a video editing expert. The user will describe a video. You will provide detailed, actionable suggestions on how to enhance its quality (e.g., color correction steps, stabilization techniques, lighting adjustments, audio improvements). Format the response using markdown.',
    placeholder: 'مثال: فيديو مصور بهاتف قديم في إضاءة منخفضة وبه اهتزاز...',
    buttonText: 'اقترح تحسينات',
    inputType: 'textarea'
  },
  translation: {
    title: 'الترجمة على الفيديو',
    systemInstruction: 'You are a professional video subtitler. The user will provide text, often in SRT format, and a target language. Translate the text accurately while preserving the SRT timestamps and formatting. If the input is not in SRT format, translate the text and explain how to create a basic SRT file for it.',
    placeholder: '1\n00:00:01,000 --> 00:00:05,000\nHello world, this is a subtitle example.\n\n2\n00:00:06,000 --> 00:00:09,000\nTranslate this to Arabic.',
    buttonText: 'ترجم ملف SRT',
    inputType: 'textarea'
  },
  animation: {
    title: 'توليد رسوم متحركة',
    systemInstruction: 'You are a storyboard artist and animation director. Based on the user\'s prompt, write a scene-by-scene description for a short animation. Include visual details, character actions, camera angles, and suggested sound effects. Format as a list.',
    placeholder: 'مثال: روبوت صغير يكتشف زهرة متوهجة في غابة مظلمة...',
    buttonText: 'اكتب القصة المصورة',
    inputType: 'textarea'
  },
  deepfake: {
    title: 'Deepfake إبداعي',
    systemInstruction: 'You are a creative director specializing in ethical and artistic applications of generative AI. The user will propose an idea. You are to expand on this concept for an art project, film, or educational tool. Describe the creative vision, technical approach, and ethical considerations in detail.',
    placeholder: 'مثال: فيلم وثائقي تاريخي حيث يتحدث عالم قديم بصوته عن اكتشافاته...',
    buttonText: 'اشرح المفهوم الإبداعي',
    inputType: 'textarea'
  },
};

const VideoTools: React.FC<VideoToolsProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<VideoToolTab>('enhancer');
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTabChange = (tab: VideoToolTab) => {
        setActiveTab(tab);
        setPrompt('');
        setResult('');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const details = toolDetails[activeTab];
        if (!prompt.trim()) {
            setError('الرجاء إدخال نص في الحقل.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const generatedText = await generateTextForTool(prompt, details.systemInstruction);
            setResult(generatedText);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const TabButton = ({ tab, label }: { tab: VideoToolTab, label: string }) => (
        <button
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors w-full ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-blue-600' : 'bg-slate-200 dark:bg-slate-900 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
        >
            {label}
        </button>
    );

    const currentTool = toolDetails[activeTab];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity mb-4">
                        <BackIcon className="w-5 h-5" />
                        العودة إلى كل الأدوات
                    </button>
                    <h2 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-4 text-center flex items-center justify-center gap-2">
                        <VideoIcon className="w-6 h-6" />
                        مجموعة أدوات الفيديو
                    </h2>
                     <div className="flex bg-slate-200 dark:bg-slate-900 rounded-lg p-1 text-xs sm:text-sm">
                        <TabButton tab="enhancer" label="تحسين الجودة" />
                        <TabButton tab="translation" label="الترجمة" />
                        <TabButton tab="animation" label="الرسوم المتحركة" />
                        <TabButton tab="deepfake" label="Deepfake إبداعي" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center">{currentTool.title}</h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                         <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={currentTool.placeholder}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-y focus:ring-2 focus:ring-blue-500 focus:outline-none transition min-h-[150px]"
                            rows={6}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="w-full h-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                        >
                            {isLoading ? 'جارٍ العمل...' : currentTool.buttonText}
                        </button>
                    </form>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 mt-8">
                            <Spinner />
                            <p className="mt-4">يقوم الذكاء الاصطناعي بمعالجة طلبك...</p>
                        </div>
                    )}
                    {error && <p className="mt-4 text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg">{error}</p>}
                    {result && (
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">النتيجة:</h3>
                            <div
                                className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: marked.parse(result) }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoTools;
