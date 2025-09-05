
import React, { useState } from 'react';
import Spinner from './Spinner';
import BackIcon from './icons/BackIcon';
import VideoQuizIcon from './icons/VideoQuizIcon';
import * as aiService from '../services/aiService';
import { VideoAnalysisResult } from '../types';

interface VideoProcessorToolProps {
    onBack: () => void;
}

const VideoProcessorTool: React.FC<VideoProcessorToolProps> = ({ onBack }) => {
    const [videoUrl, setVideoUrl] = useState('');
    const [result, setResult] = useState<VideoAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAnswers, setShowAnswers] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoUrl.trim()) {
            setError('الرجاء إدخال رابط فيديو صالح.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        setShowAnswers(false);

        try {
            const analysisResult = await aiService.summarizeAndQuizVideo(videoUrl);
            setResult(analysisResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity mb-4">
                        <BackIcon className="w-5 h-5" />
                        العودة إلى أدوات الدراسة
                    </button>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center flex items-center justify-center gap-2">
                            <VideoQuizIcon className="w-6 h-6"/>
                            تلخيص واختبار الفيديو
                        </h2>
                        <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="ألصق رابط الفيديو هنا (مثل يوتيوب)"
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                            disabled={isLoading}
                        />
                        <div className="text-xs text-center text-slate-500 dark:text-slate-400 -mt-2 pb-2">
                            ملاحظة: هذه الأداة تجريبية وقد لا تكون دقيقة دائمًا. للحصول على أفضل النتائج، يرجى استخدام روابط يوتيوب.
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !videoUrl.trim()}
                            className="w-full h-10 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                        >
                            {isLoading ? 'جارٍ التحليل...' : 'حلل الفيديو'}
                        </button>
                    </form>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
                        <Spinner />
                        <p className="mt-4">يقوم الذكاء الاصطناعي "بمشاهدة" الفيديو...</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">قد يستغرق هذا بضع لحظات.</p>
                    </div>
                )}
                {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg max-w-4xl mx-auto">{error}</p>}
                {result && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">ملخص الفيديو</h3>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{result.summary}</p>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">اختبار قصير</h3>
                                <button onClick={() => setShowAnswers(!showAnswers)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                    {showAnswers ? 'إخفاء الإجابات' : 'إظهار الإجابات'}
                                </button>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6">
                               {result.quiz.map((q, index) => (
                                    <div key={index}>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">({index + 1}) {q.question}</p>
                                        <ul className="mt-2 space-y-2 pr-5">
                                            {q.options?.map((opt, i) => (
                                                <li key={i} className={`text-slate-700 dark:text-slate-300 transition-colors ${(showAnswers && opt === q.answer) ? 'text-green-600 dark:text-green-400 font-bold' : ''}`}>
                                                    - {opt}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className={`mt-2 text-sm text-green-700 dark:text-green-500 transition-opacity duration-300 ${showAnswers ? 'opacity-100' : 'opacity-0'}`}>
                                            <strong>الإجابة الصحيحة:</strong> {q.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoProcessorTool;