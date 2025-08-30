import React, { useState } from 'react';
import ToolsIcon from './icons/ToolsIcon';

// Import tool components
import ImageGenerator from './ImageGenerator';
import VideoGenerator from './VideoGenerator';
import WebsiteGenerator from './WebsiteGenerator';
import StudyTools from './StudyTools';
import TranslationSummarization from './TranslationSummarization';
import GenericTextTool from './GenericTextTool';
import ImageEditorTool from './ImageEditorTool';
import LogoGenerator from './LogoGenerator';
import VideoTools from './VideoTools';
import AudioTools from './AudioTools';


// Import icons for the dashboard
import ImageIcon from './icons/ImageIcon';
import VideoIcon from './icons/VideoIcon';
import WebsiteIcon from './icons/WebsiteIcon';
import EducationIcon from './icons/EducationIcon';
import TranslateIcon from './icons/TranslateIcon';
import AudioWaveIcon from './icons/AudioWaveIcon';
import SparkleIcon from './icons/SparkleIcon';
import ArticleIcon from './icons/ArticleIcon';

type ActiveTool = 
    | null
    | 'image-generator'
    | 'video-generator'
    | 'website-generator'
    | 'study-tools'
    | 'translation-summarization'
    | 'logo-generator'
    | 'ui-ux-designer'
    | 'image-upscaler'
    | 'image-to-cartoon'
    | 'background-remover'
    | 'article-generator'
    | 'email-writer'
    | 'product-description-generator'
    | 'copywriting-tools'
    | 'script-writer'
    | 'video-tools'
    | 'audio-tools';
    
// Configuration object for all tools
const toolConfigs = {
    // Design & Creativity
    'image-generator': { component: ImageGenerator, props: {} },
    'logo-generator': { component: LogoGenerator, props: {} },
    'ui-ux-designer': { component: GenericTextTool, props: { title: 'تصميم واجهات المستخدم', icon: <WebsiteIcon className="w-full h-full" />, systemInstruction: 'You are a UI/UX designer. Based on the user\'s prompt, generate a detailed description of a user interface, including layout, components, color scheme, and typography. Use markdown for structure.', inputLabel: 'صف التطبيق أو الموقع الذي تريد تصميمه:', placeholder: 'مثال: تطبيق لتوصيل الطعام بواجهة بسيطة وعصرية...', buttonText: 'تصميم' } },
    'image-upscaler': { component: ImageEditorTool, props: { title: 'تحسين جودة الصور', icon: <ImageIcon className="w-full h-full" />, editMode: 'upscale' } },
    'image-to-cartoon': { component: ImageEditorTool, props: { title: 'تحويل الصور لكرتون', icon: <ImageIcon className="w-full h-full" />, editMode: 'cartoonify' } },
    'background-remover': { component: ImageEditorTool, props: { title: 'إزالة الخلفيات', icon: <ImageIcon className="w-full h-full" />, editMode: 'background-remove' } },
    // Video & Motion
    'video-generator': { component: VideoGenerator, props: {} },
    'video-tools': { component: VideoTools, props: {} },
    // Audio & Music
    'audio-tools': { component: AudioTools, props: {} },
    // Content & Writing
    'website-generator': { component: WebsiteGenerator, props: {} },
    'translation-summarization': { component: TranslationSummarization, props: {} },
    'article-generator': { component: GenericTextTool, props: { title: 'توليد مقالات ومدونات', icon: <ArticleIcon className="w-full h-full" />, systemInstruction: 'You are a professional blog writer. Write a well-structured and engaging article based on the user\'s topic.', inputLabel: 'موضوع المقال:', placeholder: 'مثال: أهمية الذكاء الاصطناعي في التعليم...', buttonText: 'اكتب المقال' } },
    'email-writer': { component: GenericTextTool, props: { title: 'مساعد كتابة إيميلات', icon: <ArticleIcon className="w-full h-full" />, systemInstruction: 'You are a professional assistant. Write a clear, concise, and polite email based on the user\'s request.', inputLabel: 'ما هو موضوع البريد الإلكتروني؟', placeholder: 'مثال: اكتب بريدًا إلكترونيًا لطلب إجازة لمدة ثلاثة أيام...', buttonText: 'اكتب البريد' } },
    'product-description-generator': { component: GenericTextTool, props: { title: 'توليد وصف منتجات', icon: <ArticleIcon className="w-full h-full" />, systemInstruction: 'You are a marketing copywriter. Write a persuasive and appealing product description based on the user\'s input.', inputLabel: 'صف المنتج:', placeholder: 'مثال: سماعات بلوتوث لاسلكية مع ميزة عزل الضوضاء...', buttonText: 'اكتب الوصف' } },
    'copywriting-tools': { component: GenericTextTool, props: { title: 'أدوات كتابة إعلانية', icon: <ArticleIcon className="w-full h-full" />, systemInstruction: 'You are an expert advertiser (copywriter). Generate a catchy and effective ad copy based on the user\'s product and target audience.', inputLabel: 'ما الذي تريد الإعلان عنه؟', placeholder: 'مثال: إعلان لمتجر قهوة جديد يستهدف الشباب...', buttonText: 'اكتب الإعلان' } },
    'script-writer': { component: GenericTextTool, props: { title: 'كتابة سيناريوهات', icon: <ArticleIcon className="w-full h-full" />, systemInstruction: 'You are a screenwriter. Write a short script for a video or podcast based on the user\'s topic and desired tone.', inputLabel: 'صف فكرة السيناريو:', placeholder: 'مثال: سيناريو لفيديو يوتيوب مدته 5 دقائق عن السفر الاقتصادي...', buttonText: 'اكتب السيناريو' } },
    // Education
    'study-tools': { component: StudyTools, props: {} }
};

interface ToolCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col items-center text-center relative cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/30 dark:hover:shadow-cyan-400/30 hover:border-cyan-500 dark:hover:border-cyan-400 hover:-translate-y-2`}
    >
        <div className="w-10 h-10 mb-3 text-cyan-600 dark:text-cyan-400">{icon}</div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">{description}</p>
    </div>
);

interface ToolCategoryProps {
    title: string;
    children: React.ReactNode;
}

const ToolCategory: React.FC<ToolCategoryProps> = ({ title, children }) => (
    <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-center">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {children}
        </div>
    </div>
);

const Tools: React.FC = () => {
    const [activeTool, setActiveTool] = useState<ActiveTool>(null);
    
    const handleBack = () => setActiveTool(null);

    if (activeTool) {
        const config = toolConfigs[activeTool];
        if (config) {
            // FIX: Cast component to React.FC<any> to resolve TypeScript error with props union type.
            const ToolComponent = config.component as React.FC<any>;
            return <ToolComponent {...config.props} onBack={handleBack} />;
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-300 mb-2 text-center flex items-center justify-center gap-3">
                        <ToolsIcon className="w-8 h-8" />
                        مركز الأدوات
                    </h2>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        استكشف مجموعة أدوات الذكاء الاصطناعي لإطلاق العنان لإبداعك وإنتاجيتك.
                    </p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    
                    <ToolCategory title="🎨 التصميم والإبداع">
                        <ToolCard icon={<ImageIcon className="w-full h-full" />} title="توليد الصور" description="حوّل أوصافك النصية إلى صور فنية مذهلة بأنماط متنوعة." onClick={() => setActiveTool('image-generator')} />
                        <ToolCard icon={<SparkleIcon className="w-full h-full" />} title="توليد الشعارات" description="أنشئ شعارات فريدة لعلامتك التجارية أو مشروعك في ثوانٍ." onClick={() => setActiveTool('logo-generator')} />
                        <ToolCard icon={<WebsiteIcon className="w-full h-full" />} title="تصميم واجهات المستخدم" description="احصل على أفكار وتصميمات أولية لواجهات المستخدم لتطبيقاتك ومواقعك." onClick={() => setActiveTool('ui-ux-designer')} />
                        <ToolCard icon={<ImageIcon className="w-full h-full" />} title="تحسين جودة الصور" description="ارفع دقة صورك القديمة أو منخفضة الجودة بلمسة زر." onClick={() => setActiveTool('image-upscaler')} />
                        <ToolCard icon={<ImageIcon className="w-full h-full" />} title="تحويل الصور لكرتون" description="أضف لمسة فنية على صورك بتحويلها إلى رسومات أو أنمي." onClick={() => setActiveTool('image-to-cartoon')} />
                        <ToolCard icon={<ImageIcon className="w-full h-full" />} title="إزالة الخلفيات" description="أزل خلفيات الصور بسهولة ودقة عالية." onClick={() => setActiveTool('background-remover')} />
                    </ToolCategory>

                    <ToolCategory title="🎬 الفيديو والموشن">
                        <ToolCard icon={<VideoIcon className="w-full h-full" />} title="توليد فيديو من نص" description="حوّل أفكارك وسيناريوهاتك إلى مقاطع فيديو قصيرة وجذابة." onClick={() => setActiveTool('video-generator')} />
                        <ToolCard icon={<VideoIcon className="w-full h-full" />} title="مجموعة أدوات الفيديو" description="حسّن جودة الفيديو، أضف ترجمات، وأنشئ رسومًا متحركة بسيطة." onClick={() => setActiveTool('video-tools')} />
                    </ToolCategory>

                    <ToolCategory title="✍️ المحتوى والكتابة">
                         <ToolCard icon={<WebsiteIcon className="w-full h-full" />} title="مولد المواقع" description="ابنِ صفحات ويب كاملة وجاهزة للنشر بمجرد وصف الفكرة." onClick={() => setActiveTool('website-generator')} />
                         <ToolCard icon={<TranslateIcon className="w-full h-full" />} title="الترجمة والتلخيص" description="ترجم النصوص بين لغات متعددة أو لخص المقالات الطويلة." onClick={() => setActiveTool('translation-summarization')} />
                         <ToolCard icon={<ArticleIcon className="w-full h-full" />} title="توليد مقالات ومدونات" description="أنشئ مسودات أولية لمقالاتك ومدوناتك حول أي موضوع." onClick={() => setActiveTool('article-generator')} />
                         <ToolCard icon={<ArticleIcon className="w-full h-full" />} title="مساعد كتابة إيميلات" description="احصل على المساعدة في صياغة رسائل بريد إلكتروني احترافية." onClick={() => setActiveTool('email-writer')} />
                         <ToolCard icon={<ArticleIcon className="w-full h-full" />} title="توليد وصف منتجات" description="اكتب وصفًا جذابًا ومقنعًا لمنتجاتك لزيادة المبيعات." onClick={() => setActiveTool('product-description-generator')} />
                         <ToolCard icon={<ArticleIcon className="w-full h-full" />} title="أدوات كتابة إعلانية" description="أنشئ نصوصًا إعلانية فعالة لمنصات التواصل الاجتماعي وغيرها." onClick={() => setActiveTool('copywriting-tools')} />
                         <ToolCard icon={<ArticleIcon className="w-full h-full" />} title="كتابة سيناريوهات" description="اكتب سيناريوهات لمقاطع الفيديو أو البودكاست الخاصة بك." onClick={() => setActiveTool('script-writer')} />
                    </ToolCategory>

                    <ToolCategory title="🎵 الصوت والموسيقى">
                        <ToolCard icon={<AudioWaveIcon className="w-full h-full" />} title="استوديو الصوت والموسيقى" description="توليد موسيقى، تحويل النص إلى كلام، تحسين الصوت، والمزيد." onClick={() => setActiveTool('audio-tools')} />
                    </ToolCategory>
                    
                     <ToolCategory title="🎓 التعليم والدراسة">
                         <ToolCard icon={<EducationIcon className="w-full h-full" />} title="مساعد الدراسة الذكي" description="مجموعة أدوات متكاملة لشرح المفاهيم، إنشاء الاختبارات، والمزيد." onClick={() => setActiveTool('study-tools')} />
                    </ToolCategory>

                </div>
            </div>
        </div>
    );
};

export default Tools;