import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, getVideoOperationStatus, getApiKey as getGeminiApiKey } from '../services/geminiService';
import * as creationsService from '../services/creationsService';
import Spinner from './Spinner';
import VideoIcon from './icons/VideoIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';

const loadingMessages = [
    "جارٍ إعداد المشهد...",
    "الكاميرات تدور الآن...",
    "يتم توليد الإطارات الأولى...",
    "الذكاء الاصطناعي يضيف لمساته السحرية...",
    "وشكنا على الانتهاء، يتم تجميع الفيديو...",
    "قد يستغرق الأمر بضع دقائق، شكرًا لصبرك...",
];

const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    
    const intervalRef = useRef<number | null>(null);
    const messageIntervalRef = useRef<number | null>(null);
    const creationIdRef = useRef<string | null>(null);

    const cleanupIntervals = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (messageIntervalRef.current) {
            clearInterval(messageIntervalRef.current);
            messageIntervalRef.current = null;
        }
    };

    useEffect(() => {
        return cleanupIntervals;
    }, []);

    const pollOperation = (operation: any) => {
        let messageIndex = 0;
        messageIntervalRef.current = window.setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 5000);

        intervalRef.current = window.setInterval(async () => {
            try {
                const updatedOperation = await getVideoOperationStatus(operation);
                if (updatedOperation.done) {
                    cleanupIntervals();
                    const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink && creationIdRef.current) {
                        try {
                            const apiKey = getGeminiApiKey(); // This now correctly gets the user's key if set
                            const finalUrl = `${downloadLink}&key=${apiKey}`;
                            setVideoUrl(finalUrl);
                             creationsService.updateCreation(creationIdRef.current, { status: 'completed', data: finalUrl });
                        } catch (e) {
                             const err = e instanceof Error ? e.message : "API Key not configured."
                             setError(err);
                             if(creationIdRef.current) creationsService.updateCreation(creationIdRef.current, { status: 'failed', error: err });
                             setIsLoading(false);
                             return; 
                        }
                    } else {
                        const err = updatedOperation.error?.message || "فشل توليد الفيديو أو لم يتم العثور على رابط.";
                        setError(err);
                        if(creationIdRef.current) creationsService.updateCreation(creationIdRef.current, { status: 'failed', error: err });
                    }
                    setIsLoading(false);
                }
            } catch (err) {
                cleanupIntervals();
                const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء التحقق من حالة الفيديو.';
                setError(errorMessage);
                if(creationIdRef.current) creationsService.updateCreation(creationIdRef.current, { status: 'failed', error: errorMessage });
                setIsLoading(false);
            }
        }, 10000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('الرجاء إدخال وصف للفيديو.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        setLoadingMessage(loadingMessages[0]);

        creationIdRef.current = creationsService.addCreation({
            type: 'Video',
            prompt,
            status: 'pending',
        });

        try {
            const operation = await generateVideo(prompt);
            pollOperation(operation);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
            if(creationIdRef.current) creationsService.updateCreation(creationIdRef.current, { status: 'failed', error: errorMessage });
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-2 text-center">توليد الفيديو بالذكاء الاصطناعي</h2>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="مثال: سيارة رياضية تسير بسرعة على طريق جبلي عند غروب الشمس..."
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        rows={3}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="w-full h-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                    >
                        {isLoading ? 'جارٍ التوليد...' : 'توليد الفيديو'}
                    </button>
                </form>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
                        <Spinner />
                        <p className="mt-4 text-lg">{loadingMessage}</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">هذه العملية قد تستغرق عدة دقائق. يمكنك القيام بشيء آخر والعودة لاحقًا.</p>
                    </div>
                )}
                {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg">{error}</p>}
                {videoUrl && (
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center">الفيديو الخاص بك جاهز!</h3>
                        <video controls src={videoUrl} className="w-full rounded-lg shadow-lg" />
                         <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <a
                                href={videoUrl}
                                download={`${prompt.substring(0, 20).replace(/\s+/g, '_')}_${Date.now()}.mp4`}
                                className="flex-1 h-10 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-semibold flex items-center justify-center"
                            >
                                تحميل الفيديو
                            </a>
                            <a
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sm:w-auto h-10 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors font-semibold flex items-center justify-center gap-2"
                            >
                                <ExternalLinkIcon className="w-5 h-5" />
                                معاينة خارجية
                            </a>
                        </div>
                    </div>
                )}
                 {!isLoading && !videoUrl && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <VideoIcon className="w-24 h-24 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">حوّل أفكارك إلى فيديو</h3>
                        <p>اكتب وصفاً في الأعلى ودع الذكاء الاصطناعي يخرجه لك.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default VideoGenerator;