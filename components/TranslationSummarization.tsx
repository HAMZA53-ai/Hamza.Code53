import React, { useState } from 'react';
import Spinner from './Spinner';
import TranslateIcon from './icons/TranslateIcon';
import * as geminiService from '../services/geminiService';
import CopyIcon from './icons/CopyIcon';
import BackIcon from './icons/BackIcon';

type ActiveTab = 'translate' | 'summarize';

interface TranslationSummarizationProps {
    onBack: () => void;
}

const TranslationSummarization: React.FC<TranslationSummarizationProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('translate');
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('English');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const languages = ["English", "Spanish", "French", "German", "Japanese", "Chinese", "Russian", "Arabic"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) {
            setError('الرجاء إدخال نص.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutputText('');

        try {
            let result = '';
            if (activeTab === 'translate') {
                result = await geminiService.translateText(inputText, targetLanguage);
            } else {
                result = await geminiService.summarizeText(inputText);
            }
            setOutputText(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (outputText) {
            navigator.clipboard.writeText(outputText);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const TabButton = ({ tab, label }: { tab: ActiveTab, label: string }) => (
        <button
            onClick={() => { setActiveTab(tab); setOutputText(''); setError(null); }}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors w-full ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-orange-600' : 'bg-slate-200 dark:bg-slate-900 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 md:px-6 md:pt-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity mb-4">
                        <BackIcon className="w-5 h-5" />
                        العودة إلى الأدوات
                    </button>
                    <h2 className="text-xl font-bold text-orange-600 dark:text-orange-300 mb-4 text-center flex items-center justify-center gap-2">
                        <TranslateIcon className="w-6 h-6" />
                        الترجمة والتلخيص
                    </h2>
                    <div className="flex bg-slate-200 dark:bg-slate-900 rounded-lg p-1">
                        <TabButton tab="translate" label="ترجمة" />
                        <TabButton tab="summarize" label="تلخيص" />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-4">
                    {activeTab === 'translate' && (
                        <div className="mb-2">
                            <label htmlFor="targetLanguage" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">الترجمة إلى:</label>
                            <select
                                id="targetLanguage"
                                value={targetLanguage}
                                onChange={(e) => setTargetLanguage(e.target.value)}
                                disabled={isLoading}
                                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            >
                                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                            </select>
                        </div>
                    )}
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={activeTab === 'translate' ? 'اكتب النص المراد ترجمته هنا...' : 'اكتب النص الطويل المراد تلخيصه هنا...'}
                        className="w-full h-36 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-y focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputText.trim()}
                        className="w-full h-10 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                    >
                        {isLoading ? (activeTab === 'translate' ? 'جارٍ الترجمة...' : 'جارٍ التلخيص...') : (activeTab === 'translate' ? 'ترجم' : 'لخص')}
                    </button>

                    {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg">{error}</p>}
                    
                    {(isLoading || outputText) && (
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">النتيجة:</h3>
                                {outputText && (
                                     <button 
                                        type="button"
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        {copySuccess ? 'تم النسخ!' : <><CopyIcon className="w-4 h-4" /> نسخ</>}
                                    </button>
                                )}
                            </div>
                            <div className="w-full min-h-[9rem] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap flex items-center justify-center">
                                {isLoading ? <Spinner /> : outputText}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default TranslationSummarization;