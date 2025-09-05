import React, { useState } from 'react';
import Spinner from './Spinner';
import BackIcon from './icons/BackIcon';
import { generateTextForTool } from '../services/aiService';

interface GenericTextToolProps {
  title: string;
  icon: React.ReactNode;
  onBack: () => void;
  systemInstruction: string;
  inputLabel: string;
  placeholder: string;
  buttonText: string;
}

const GenericTextTool: React.FC<GenericTextToolProps> = ({
  title,
  icon,
  onBack,
  systemInstruction,
  inputLabel,
  placeholder,
  buttonText
}) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('الرجاء إدخال نص في الحقل.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      const generatedText = await generateTextForTool(prompt, systemInstruction);
      setResult(generatedText);
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
            العودة إلى كل الأدوات
          </button>
          <div className="text-center">
            <div className="w-12 h-12 text-cyan-600 dark:text-cyan-400 mx-auto mb-2">{icon}</div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="prompt-input" className="font-semibold text-slate-700 dark:text-slate-300">
              {inputLabel}
            </label>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-y focus:ring-2 focus:ring-cyan-500 focus:outline-none transition min-h-[120px]"
              rows={5}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full h-10 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
            >
              {isLoading ? 'جارٍ العمل...' : buttonText}
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

export default GenericTextTool;
