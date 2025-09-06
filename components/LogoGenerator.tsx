
import React, { useState } from 'react';
import { generateLogo } from '../services/aiService';
import * as creationsService from '../services/creationsService';
import Spinner from './Spinner';
import BackIcon from './icons/BackIcon';
import SparkleIcon from './icons/SparkleIcon';
import { getToolSettings } from '../services/toolSettingsService';

interface LogoGeneratorProps {
    onBack: () => void;
}

const LogoGenerator: React.FC<LogoGeneratorProps> = ({ onBack }) => {
  const settings = getToolSettings();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(settings.logoGenerator?.style || 'minimalist');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('الرجاء إدخال وصف للشعار.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImages([]);

    const creationId = creationsService.addCreation({
      type: 'Logo',
      prompt,
      status: 'pending',
    });

    try {
      const generatedImages = await generateLogo(prompt, style);
      setImages(generatedImages);
      creationsService.updateCreation(creationId, {
        status: 'completed',
        data: generatedImages,
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity mb-4">
            <BackIcon className="w-5 h-5" />
            العودة إلى كل الأدوات
          </button>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-purple-600 dark:text-purple-300 mb-2 text-center flex items-center justify-center gap-2">
                <SparkleIcon className="w-6 h-6"/>
                توليد الشعارات
            </h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثال: أسد يرتدي تاجًا لشركة استشارات مالية..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
              rows={3}
              disabled={isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="style" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">نمط الشعار</label>
                <select
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="minimalist">بسيط (Minimalist)</option>
                  <option value="modern">حديث (Modern)</option>
                  <option value="vintage">عتيق (Vintage)</option>
                  <option value="geometric">هندسي (Geometric)</option>
                  <option value="abstract">تجريدي (Abstract)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="md:self-end w-full h-10 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
              >
                {isLoading ? 'جارٍ التصميم...' : 'صمم الشعار'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
            <Spinner />
            <p className="mt-4">يبدع الذكاء الاصطناعي في تصميم شعارك...</p>
          </div>
        )}
        {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg">{error}</p>}
        {images.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((imgSrc, index) => (
                <div key={index} className="bg-white dark:bg-slate-200 p-2 rounded-lg shadow-md">
                  <img src={imgSrc} alt={`شعار مولد ${index + 1}`} className="w-full object-contain rounded-md" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoGenerator;