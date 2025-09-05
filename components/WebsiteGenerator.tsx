import React, { useState } from 'react';
import { generateWebsite } from '../services/aiService';
import * as creationsService from '../services/creationsService';
import { WebTechStack } from '../types';
import { exportToCodePen } from '../utils/codepenExporter';
import Spinner from './Spinner';
import WebsiteIcon from './icons/WebsiteIcon';
import CopyIcon from './icons/CopyIcon';
import BackIcon from './icons/BackIcon';
import DownloadIcon from './icons/DownloadIcon';
import ShareIcon from './icons/ShareIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';

interface WebsiteGeneratorProps {
  onBack: () => void;
}

const WebsiteGenerator: React.FC<WebsiteGeneratorProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [techStack, setTechStack] = useState<WebTechStack>('tailwind');
  const [language, setLanguage] = useState('Arabic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copySuccess, setCopySuccess] = useState(false);

  const languages = ['Arabic', 'English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Russian'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('الرجاء إدخال وصف للموقع.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedCode(null);
    setSubmittedPrompt(prompt);
    setActiveTab(techStack === 'react-tailwind' ? 'code' : 'preview');
    
    const creationId = creationsService.addCreation({
      type: 'Website',
      prompt,
      status: 'pending',
      techStack: techStack,
    });

    try {
      let code = await generateWebsite(prompt, techStack, language);
      setGeneratedCode(code);
      creationsService.updateCreation(creationId, {
        status: 'completed',
        data: code,
        techStack: techStack,
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

  const handleCopyCode = () => {
    if (generatedCode) {
        navigator.clipboard.writeText(generatedCode);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getFileExtension = () => {
    switch (techStack) {
      case 'react-tailwind': return 'jsx';
      default: return 'html';
    }
  };
  
  const handleDownloadCode = () => {
    if (generatedCode) {
        const blob = new Blob([generatedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `website_${Date.now()}.${getFileExtension()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
  };
  
  const handleTemporaryPreview = () => {
    if (generatedCode) {
        const blob = new Blob([generatedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
  };
  
  const handleShareToCodePen = () => {
    if (generatedCode) {
        exportToCodePen(generatedCode, submittedPrompt, techStack);
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
              <h2 className="text-xl font-bold text-green-600 dark:text-green-300 mb-2 text-center">مولد المواقع العالمي</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="مثال: صفحة هبوط لتطبيق جوال متخصص في تتبع اللياقة البدنية..."
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                rows={3}
                disabled={isLoading}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">لغة الموقع</label>
                   <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                        {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
                <div>
                  <label htmlFor="techStack" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">التقنية المستخدمة</label>
                  <select
                    id="techStack"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value as WebTechStack)}
                    disabled={isLoading}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="tailwind">HTML + Tailwind CSS</option>
                    <option value="html-css">HTML + Inline CSS</option>
                    <option value="react-tailwind">React + Tailwind CSS</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="md:self-end w-full h-10 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                >
                  {isLoading ? 'جارٍ البناء...' : 'توليد الموقع'}
                </button>
              </div>
            </form>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
            <Spinner />
            <p className="mt-4">يقوم الذكاء الاصطناعي ببناء موقعك العالمي...</p>
          </div>
        )}
        {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg">{error}</p>}
        {generatedCode && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">موقع ويب للوصف:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{submittedPrompt}</p>
            </div>

            <div className="flex border-b border-slate-300 dark:border-slate-700 mb-4">
                <button
                    onClick={() => setActiveTab('preview')}
                    disabled={techStack === 'react-tailwind'}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'preview' ? 'border-b-2 border-green-500 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    } ${techStack === 'react-tailwind' ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    معاينة
                </button>
                <button
                    onClick={() => setActiveTab('code')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'code' ? 'border-b-2 border-green-500 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    الكود المصدري ({getFileExtension()})
                </button>
            </div>

            <div>
                {activeTab === 'preview' ? (
                     <iframe
                        srcDoc={generatedCode}
                        title="Website Preview"
                        className="w-full h-[60vh] border border-slate-300 dark:border-slate-700 rounded-lg bg-white"
                        sandbox="allow-scripts allow-same-origin"
                    />
                ) : (
                    <div className="relative">
                        <button
                            onClick={handleCopyCode}
                            className="absolute top-2 left-2 flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors backdrop-blur-sm z-10"
                            title="نسخ الكود"
                        >
                           {copySuccess ? 'تم النسخ!' : <><CopyIcon className="w-4 h-4" /> نسخ</>}
                        </button>
                        <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 h-[60vh]">
                            <code className="whitespace-pre">{generatedCode}</code>
                        </pre>
                    </div>
                )}
            </div>
             <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button onClick={handleTemporaryPreview} className="flex-1 h-10 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors font-semibold flex items-center justify-center gap-2">
                    <ExternalLinkIcon className="w-5 h-5" />
                    معاينة مؤقتة
                </button>
                <button onClick={handleShareToCodePen} className="flex-1 h-10 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-semibold flex items-center justify-center gap-2">
                    <ShareIcon className="w-5 h-5" />
                    مشاركة على CodePen
                </button>
                 <button onClick={handleDownloadCode} className="flex-1 h-10 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors font-semibold flex items-center justify-center gap-2">
                    <DownloadIcon className="w-5 h-5" />
                    تحميل الملف
                </button>
            </div>
          </div>
        )}
        {!isLoading && !generatedCode && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <WebsiteIcon className="w-24 h-24 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">حوّل فكرتك إلى موقع ويب عالمي</h3>
            <p>اكتب وصفاً واختر اللغة والتقنية، ثم دع الذكاء الاصطناعي يبرمجه لك.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteGenerator;
