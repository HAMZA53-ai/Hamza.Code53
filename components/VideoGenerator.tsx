

import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, getVideoOperationStatus, getActiveApiKey } from '../services/aiService';
import * as creationsService from '../services/creationsService';
import Spinner from './Spinner';
import VideoIcon from './icons/VideoIcon';
import BackIcon from './icons/BackIcon';
import ImageIcon from './icons/ImageIcon';


const loadingMessages = [
    "جارٍ إعداد المشهد...",
    "الكاميرات تدور الآن...",
    "يتم توليد الإطارات الأولى...",
    "الذكاء الاصطناعي يضيف لمساته السحرية...",
    "وشكنا على الانتهاء، يتم تجميع الفيديو...",
    "قد يستغرق الأمر بضع دقائق، شكرًا لصبرك...",
];

interface VideoGeneratorProps {
  onBack: () => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [submittedPrompt, setSubmittedPrompt] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    
    const intervalRef = useRef<number | null>(null);
    const messageIntervalRef = useRef<number | null>(null);
    const creationIdRef = useRef<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

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
                             const apiKey = getActiveApiKey();
                             if (!apiKey) throw new Error("مفتاح API غير مكون.");
                             
                             const response = await fetch(`${downloadLink}&key=${apiKey}`);
                             if (!response.ok) {
                                 throw new Error(`فشل تحميل الفيديو: ${response.statusText}`);
                             }
                             const videoBlob = await response.blob();
                             const objectUrl = URL.createObjectURL(videoBlob);

                             setVideoUrl(objectUrl);
                             creationsService.updateCreation(creationIdRef.current, { status: 'completed', data: objectUrl });
                        } catch (e) {
                             const err = e instanceof Error ? e.message : "فشل في جلب الفيديو."
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
        setSubmittedPrompt(prompt);

        creationIdRef.current = creationsService.addCreation({
            type: 'Video',
            prompt,
            status: 'pending',
        });

        try {
            let imageData: { data: string; mimeType: string } | undefined = undefined;
            if (image) {
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64Data = (event.target?.result as string).split(',')[1];
                        resolve({ data: base64Data, mimeType: image.file.type });
                    };
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(image.file);
                });
            }
            const operation = await generateVideo(prompt, imageData);
            pollOperation(operation);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
            if(creationIdRef.current) creationsService.updateCreation(creationIdRef.current, { status: 'failed', error: errorMessage });
            setIsLoading(false);
        }
    };

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setImage({ file, preview: URL.createObjectURL(file) });
            setError(null);
        } else {
            setError('الرجاء تحديد ملف صورة صالح.');
        }
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };


    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity mb-4">
                        <BackIcon className="w-5 h-5" />
                        العودة إلى الأدوات
                    </button>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-2 text-center">توليد الفيديو بالذكاء الاصطناعي</h2>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="مثال: سيارة رياضية تسير بسرعة على طريق جبلي عند غروب الشمس..."
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            rows={3}
                            disabled={isLoading}
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                صورة اختيارية (لتحريكها أو استخدامها كمرجع)
                            </label>
                            {image ? (
                                <div className="relative w-48 mx-auto">
                                    <img src={image.preview} alt="Preview" className="w-full h-auto rounded-lg shadow-md" />
                                    <button
                                        type="button"
                                        onClick={() => setImage(null)}
                                        className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center text-xs"
                                        aria-label="إزالة الصورة"
                                    >
                                        &#x2715;
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    onDrop={handleDrop} 
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    className="relative w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center transition-colors"
                                >
                                    {isDragging && (
                                        <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10 border-2 border-blue-500">
                                            <p className="text-xl font-bold text-blue-300">أفلت الصورة هنا</p>
                                        </div>
                                    )}
                                    <ImageIcon className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">اسحب وأفلت صورة أو</p>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold">اختر ملفًا</button>
                                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} className="hidden" accept="image/*" />
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="w-full h-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                        >
                            {isLoading ? 'جارٍ التوليد...' : 'توليد الفيديو'}
                        </button>
                    </form>
                </div>
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
                        <div className="mb-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500 dark:text-slate-400">فيديو للوصف:</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{submittedPrompt}</p>
                        </div>
                        <video controls src={videoUrl} className="w-full rounded-lg shadow-lg" />
                         <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <a
                                href={videoUrl}
                                download={`${prompt.substring(0, 20).replace(/\s+/g, '_')}_${Date.now()}.mp4`}
                                className="flex-1 h-10 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-semibold flex items-center justify-center"
                            >
                                تحميل الفيديو
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