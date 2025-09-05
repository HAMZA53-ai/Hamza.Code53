import React, { useState } from 'react';
import Spinner from './Spinner';
import BackIcon from './icons/BackIcon';
import AudioWaveIcon from './icons/AudioWaveIcon';
import { generateTextForTool } from '../services/aiService';
import { marked } from 'marked';

type AudioToolTab = 'music' | 'enhancer' | 'tts' | 'cloning' | 'stt';

interface AudioToolsProps {
  onBack: () => void;
}

const AudioTools: React.FC<AudioToolsProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<AudioToolTab>('music');
    const [prompt, setPrompt] = useState('');
    const [musicGenre, setMusicGenre] = useState('Pop');
    const [musicMood, setMusicMood] = useState('Happy');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toolDetails = {
      music: { title: 'توليد موسيقى', placeholder: 'مثال: أغنية عن السفر واستكشاف أماكن جديدة...' },
      enhancer: { title: 'تحسين جودة الصوت (تنظيف النص)', placeholder: 'مثال: حسنًا، أمم، أعتقد أن النقطة الأولى هي... آه... أننا يجب أن نركز على...' },
      tts: { title: 'تحويل النص إلى كلام', placeholder: 'اكتب النص هنا لتحويله إلى نص وصفي لمحرك الكلام...' },
      cloning: { title: 'استنساخ الأصوات', placeholder: 'اكتب "أريد نصًا لتدريب صوتي" للحصول على نص متنوع صوتيًا...' },
      stt: { title: 'تحويل الكلام إلى نص (تنسيق)', placeholder: 'مرحبا كيف حالك انا بخير شكرا لك...' },
    };

    const handleTabChange = (tab: AudioToolTab) => {
        setActiveTab(tab);
        setPrompt('');
        setResult('');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('الرجاء إدخال نص في الحقل.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult('');

        let finalPrompt = prompt;
        let systemInstruction = '';

        switch (activeTab) {
            case 'music':
                finalPrompt = `An ${musicMood}, ${musicGenre} song about: "${prompt}"`;
                systemInstruction = 'You are a music composer and lyricist. Based on the user\'s prompt (including genre, mood, and topic), generate song lyrics, a description of the musical style, tempo, and suggested chords. Format with markdown.';
                break;
            case 'enhancer':
                systemInstruction = 'You are an expert audio engineer and editor. The user will provide a text transcript that includes filler words (ums, uhs), stutters, and repetitions. Your task is to clean up the transcript to be a polished, readable, and professional text. Remove all filler words and unnecessary repetitions.';
                break;
            case 'tts':
                systemInstruction = 'You are a speech synthesis expert. Convert the user\'s text into a script with phonetic annotations and emphasis tags (like SSML) to guide a text-to-speech engine. Explain the tags used.';
                break;
            case 'cloning':
                systemInstruction = 'You are a voice coach. Provide a short, phonetically diverse script for a user to read aloud to train a voice cloning model. The script should contain a wide range of sounds in the target language (assume Arabic unless specified). Explain why the script is effective for voice training.';
                break;
            case 'stt':
                systemInstruction = 'You are a professional transcriptionist. The user will paste a raw, unpunctuated text from a speech-to-text engine. Your job is to add appropriate punctuation (commas, periods, question marks), capitalization, and paragraph breaks to make it a clean, readable transcript.';
                break;
        }

        try {
            const generatedText = await generateTextForTool(finalPrompt, systemInstruction);
            setResult(generatedText);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const TabButton = ({ tab, label }: { tab: AudioToolTab, label: string }) => (
        <button
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors w-full ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-pink-600' : 'bg-slate-200 dark:bg-slate-900 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
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
                    <h2 className="text-xl font-bold text-pink-600 dark:text-pink-300 mb-4 text-center flex items-center justify-center gap-2">
                        <AudioWaveIcon className="w-6 h-6" />
                        استوديو الصوت والموسيقى
                    </h2>
                     <div className="flex bg-slate-200 dark:bg-slate-900 rounded-lg p-1 text-xs sm:text-sm">
                        <TabButton tab="music" label="توليد موسيقى" />
                        <TabButton tab="enhancer" label="تحسين الصوت" />
                        <TabButton tab="tts" label="نص إلى كلام" />
                        <TabButton tab="cloning" label="استنساخ الصوت" />
                        <TabButton tab="stt" label="كلام إلى نص" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center">{currentTool.title}</h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {activeTab === 'music' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="musicGenre" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">النوع الموسيقي</label>
                                    <select id="musicGenre" value={musicGenre} onChange={(e) => setMusicGenre(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                        <option>Pop</option><option>Rock</option><option>Jazz</option><option>Electronic</option><option>Classical</option><option>Hip Hop</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="musicMood" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">الحالة المزاجية</label>
                                    <select id="musicMood" value={musicMood} onChange={(e) => setMusicMood(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                        <option>Happy</option><option>Sad</option><option>Energetic</option><option>Calm</option><option>Epic</option><option>Romantic</option>
                                    </select>
                                </div>
                            </div>
                        )}
                         <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={currentTool.placeholder}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-y focus:ring-2 focus:ring-pink-500 focus:outline-none transition min-h-[150px]"
                            rows={6}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="w-full h-10 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                        >
                            {isLoading ? 'جارٍ العمل...' : 'توليد'}
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

export default AudioTools;
