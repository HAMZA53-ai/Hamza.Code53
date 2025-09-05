
import React, { useState } from 'react';
import Spinner from './Spinner';
import EducationIcon from './icons/EducationIcon';
import * as aiService from '../services/aiService';
import { QuizQuestion, QuizType } from '../types';
import GenericTextTool from './GenericTextTool';
import SlidesGenerator from './SlidesGenerator';


// ADD: Import new icons for the dashboard
import BackIcon from './icons/BackIcon';
import QuizIcon from './icons/QuizIcon';
import MathIcon from './icons/MathIcon';
import SlidesIcon from './icons/SlidesIcon';

type StudyTool = 'dashboard' | 'concept-explainer' | 'quiz-generator' | 'math-solver' | 'slides-generator';

// ADD: Add onBack prop for navigation
interface StudyToolsProps {
    onBack: () => void;
}

// Concept Explainer Tool Component
const ConceptExplainerTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [topic, setTopic] = useState('');
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('الرجاء إدخال مفهوم أو سؤال.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setExplanation('');

        try {
            const result = await aiService.explainConcept(topic);
            setExplanation(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity mb-4">
                        <BackIcon className="w-5 h-5" />
                        العودة إلى لوحة الأدوات
                    </button>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                         <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center">شرح المفاهيم</h3>
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 -mt-2 mb-2">
                            أدخل أي مفهوم علمي أو سؤال وسأقوم بشرحه لك بطريقة مبسطة.
                        </p>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="مثال: اشرح لي نظرية النسبية العامة لأينشتاين..."
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                            rows={3}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !topic.trim()}
                            className="w-full h-10 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                        >
                            {isLoading ? 'جارٍ الشرح...' : 'اشرح'}
                        </button>
                    </form>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
                        <Spinner />
                        <p className="mt-4">يقوم الذكاء الاصطناعي بإعداد الشرح...</p>
                    </div>
                )}
                {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg">{error}</p>}
                {explanation && (
                    <div className="max-w-4xl mx-auto bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">شرح لـ "{topic}"</h3>
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(explanation) }} />
                    </div>
                )}
            </div>
        </>
    );
};


// Quiz Generator Tool Component
const QuizGeneratorTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [text, setText] = useState('');
    const [quizType, setQuizType] = useState<QuizType>('multiple-choice');
    const [questionCount, setQuestionCount] = useState(5);
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [showAnswers, setShowAnswers] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            setError('الرجاء إدخال نص لإنشاء اختبار منه.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setQuiz([]);
        setShowAnswers(false);

        try {
            const result = await aiService.generateQuiz(text, quizType, questionCount);
            setQuiz(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePrint = () => {
        const printContent = document.getElementById('quiz-to-print');
        if (printContent) {
            const newWindow = window.open('', '', 'height=800,width=800');
            if (newWindow) {
                newWindow.document.write('<html><head><title>Print Quiz</title>');
                newWindow.document.write('<style>body{font-family: sans-serif; direction: rtl;} .question-block{margin-bottom: 20px;} .options-list{list-style: none; padding-right: 20px;} .option-item{margin-bottom: 8px;} .no-print{display: none;}</style>');
                newWindow.document.write('</head><body>');
                newWindow.document.write(printContent.innerHTML);
                newWindow.document.write('</body></html>');
                newWindow.document.close();
                newWindow.print();
            }
        }
    };


    return (
        <>
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity mb-4">
                        <BackIcon className="w-5 h-5" />
                        العودة إلى لوحة الأدوات
                    </button>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center">مولد الاختبارات</h3>
                         <p className="text-center text-sm text-slate-500 dark:text-slate-400 -mt-2 mb-2">
                            ألصق أي نص (مقالة، ملاحظات، إلخ) لإنشاء اختبار قابل للطباعة تلقائيًا.
                        </p>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="ألصق النص هنا..."
                            className="w-full h-40 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-y focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                            disabled={isLoading}
                        />
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="quizType" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">نوع الأسئلة</label>
                                <select id="quizType" value={quizType} onChange={(e) => setQuizType(e.target.value as QuizType)} disabled={isLoading} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                                    <option value="multiple-choice">اختيار من متعدد</option>
                                    <option value="true-false">صح / خطأ</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="questionCount" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">عدد الأسئلة</label>
                                <input type="number" id="questionCount" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value))} min="1" max="15" disabled={isLoading} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !text.trim()}
                                className="md:self-end w-full h-10 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                            >
                                {isLoading ? 'جارٍ الإنشاء...' : 'أنشئ الاختبار'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                 {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
                        <Spinner />
                        <p className="mt-4">يقوم الذكاء الاصطناعي بصياغة الأسئلة...</p>
                    </div>
                )}
                {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg">{error}</p>}
                {quiz.length > 0 && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">الاختبار جاهز</h3>
                             <div className="flex gap-2">
                                <button onClick={() => setShowAnswers(!showAnswers)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{showAnswers ? 'إخفاء الإجابات' : 'إظهار الإجابات'}</button>
                                <button onClick={handlePrint} className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-500 transition-colors">طباعة</button>
                             </div>
                        </div>
                        <div id="quiz-to-print" className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6">
                           {quiz.map((q, index) => (
                                <div key={index} className="question-block">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">({index + 1}) {q.question}</p>
                                    <ul className="options-list mt-2 space-y-2 pr-5">
                                        {q.options ? q.options.map((opt, i) => (
                                            <li key={i} className={`option-item text-slate-700 dark:text-slate-300 transition-colors ${(showAnswers && opt === q.answer) ? 'text-green-600 dark:text-green-400 font-bold' : ''}`}>
                                                - {opt}
                                            </li>
                                        )) : (
                                            <>
                                                <li className={`option-item transition-colors ${(showAnswers && q.answer === 'صح') ? 'text-green-600 dark:text-green-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>- صح</li>
                                                <li className={`option-item transition-colors ${(showAnswers && q.answer === 'خطأ') ? 'text-green-600 dark:text-green-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>- خطأ</li>
                                            </>
                                        )}
                                    </ul>
                                    <p className={`no-print mt-2 text-sm text-green-700 dark:text-green-500 transition-opacity duration-300 ${showAnswers ? 'opacity-100' : 'opacity-0'}`}>
                                        <strong>الإجابة الصحيحة:</strong> {q.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// Main Study Tools Component (Dashboard)
const StudyTools: React.FC<StudyToolsProps> = ({ onBack }) => {
    const [activeTool, setActiveTool] = useState<StudyTool>('dashboard');

    const renderTool = () => {
        switch (activeTool) {
            case 'concept-explainer':
                return <ConceptExplainerTool onBack={() => setActiveTool('dashboard')} />;
            case 'quiz-generator':
                return <QuizGeneratorTool onBack={() => setActiveTool('dashboard')} />;
            case 'math-solver':
                return <GenericTextTool
                    title="حل أسئلة الرياضيات"
                    icon={<MathIcon className="w-full h-full" />}
                    onBack={() => setActiveTool('dashboard')}
                    systemInstruction="You are a math expert. Solve the user's math problem step-by-step, explaining each part of the process clearly. Use markdown for formatting equations."
                    inputLabel="أدخل المسألة الرياضية:"
                    placeholder="مثال: 2x + 5 = 15"
                    buttonText="حل"
                />;
            case 'slides-generator':
                 return <SlidesGenerator onBack={() => setActiveTool('dashboard')} />;
            default:
                return renderDashboard();
        }
    };

    const ToolCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void; }> = ({ icon, title, description, onClick }) => (
        <div
            onClick={onClick}
            className={`bg-slate-100 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col items-center text-center relative cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/30 dark:hover:shadow-cyan-400/30 hover:border-cyan-500 dark:hover:border-cyan-400 hover:-translate-y-2`}
        >
            <div className="w-12 h-12 mb-4 text-cyan-600 dark:text-cyan-400">{icon}</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    );

    const renderDashboard = () => (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto">
                     <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity mb-4">
                        <BackIcon className="w-5 h-5" />
                        العودة إلى كل الأدوات
                    </button>
                    <h2 className="text-xl font-bold text-cyan-600 dark:text-cyan-300 mb-2 text-center flex items-center justify-center gap-2">
                        <EducationIcon className="w-6 h-6" />
                        مساعد الدراسة الذكي
                    </h2>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        مجموعة من الأدوات القوية لمساعدتك في رحلتك التعليمية.
                    </p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ToolCard
                        icon={<EducationIcon className="w-full h-full" />}
                        title="شرح المفاهيم"
                        description="شرح أي موضوع أو سؤال بطريقة مبسطة وواضحة."
                        onClick={() => setActiveTool('concept-explainer')}
                    />
                    <ToolCard
                        icon={<QuizIcon className="w-full h-full" />}
                        title="مولد الاختبارات"
                        description="أنشئ اختبارات وأوراق عمل من أي نص للمراجعة والتقييم."
                        onClick={() => setActiveTool('quiz-generator')}
                    />
                     <ToolCard
                        icon={<MathIcon className="w-full h-full" />}
                        title="حل أسئلة الرياضيات"
                        description="احصل على حلول خطوة بخطوة للمسائل الرياضية المعقدة."
                        onClick={() => setActiveTool('math-solver')}
                    />
                     <ToolCard
                        icon={<SlidesIcon className="w-full h-full" />}
                        title="توليد عروض تقديمية"
                        description="حوّل نصوصك ومقالاتك إلى عروض PowerPoint كاملة."
                        onClick={() => setActiveTool('slides-generator')}
                    />
                </div>
            </div>
        </div>
    );

    return <div className="flex flex-col h-full overflow-hidden">{renderTool()}</div>;
};

export default StudyTools;