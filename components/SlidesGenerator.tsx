import React, { useState } from 'react';
import Spinner from './Spinner';
import BackIcon from './icons/BackIcon';
import SlidesIcon from './icons/SlidesIcon';
import { generateSlides } from '../services/aiService';
import * as creationsService from '../services/creationsService';
import { Slide } from '../types';
import { exportSlidesToPDF } from '../utils/pdfExporter';

const SlidesGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [topic, setTopic] = useState('');
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('الرجاء إدخال موضوع للعرض التقديمي.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSlides([]);
        setCurrentSlide(0);

        const creationId = creationsService.addCreation({
            type: 'Slides',
            prompt: topic,
            status: 'pending',
        });

        try {
            const result = await generateSlides(topic);
            setSlides(result);
            creationsService.updateCreation(creationId, {
                status: 'completed',
                data: result,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
            creationsService.updateCreation(creationId, {
                status: 'failed',
                error: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPDF = () => {
        exportSlidesToPDF(slides, topic);
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
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center flex items-center justify-center gap-2"><SlidesIcon className="w-6 h-6"/>توليد العروض التقديمية</h2>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="مثال: تاريخ استكشاف الفضاء"
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !topic.trim()}
                            className="w-full h-10 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                        >
                            {isLoading ? 'جارٍ الإنشاء...' : 'أنشئ العرض'}
                        </button>
                    </form>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-200 dark:bg-slate-900/50">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
                        <Spinner />
                        <p className="mt-4">يقوم الذكاء الاصطناعي بإعداد العرض التقديمي...</p>
                    </div>
                )}
                {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg max-w-4xl mx-auto">{error}</p>}
                {slides.length > 0 && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-slate-800 aspect-video rounded-lg shadow-lg p-8 flex flex-col justify-center items-center text-center">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{slides[currentSlide].title}</h3>
                            <ul className="text-lg text-slate-700 dark:text-slate-300 space-y-3">
                                {slides[currentSlide].content.split('\n').map((line, i) => (
                                    <li key={i}>{line.replace(/^- /, '')}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0} className="px-4 py-2 bg-slate-300 dark:bg-slate-700 rounded-lg disabled:opacity-50">السابق</button>
                            <span className="font-semibold">{currentSlide + 1} / {slides.length}</span>
                            <button onClick={() => setCurrentSlide(s => Math.min(slides.length - 1, s + 1))} disabled={currentSlide === slides.length - 1} className="px-4 py-2 bg-slate-300 dark:bg-slate-700 rounded-lg disabled:opacity-50">التالي</button>
                        </div>
                        <div className="text-center mt-6">
                            <button onClick={handleExportPDF} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-semibold">تصدير كـ PDF</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlidesGenerator;
