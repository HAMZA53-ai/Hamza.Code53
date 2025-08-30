import React, { useState } from 'react';
import ArticleIcon from './icons/ArticleIcon';
import BackIcon from './icons/BackIcon';

interface Article {
    id: string;
    title: string;
    category: 'شرح أداة' | 'مقارنة';
    summary: string;
    content: React.ReactNode;
}

const articles: Article[] = [
    {
        id: 'image-gen-guide',
        title: 'دليل المبتدئين لتوليد صور مذهلة',
        category: 'شرح أداة',
        summary: 'تعلم كيفية تحويل أفكارك النصية إلى صور فنية رائعة باستخدام أداة توليد الصور. من الأوصاف البسيطة إلى التحف الفنية المعقدة.',
        content: (
            <div className="space-y-4">
                <p>أداة توليد الصور هي بوابتك لتحويل الكلمات إلى فنون بصرية. سواء كنت مصممًا تبحث عن إلهام، أو مسوقًا تحتاج إلى محتوى فريد، أو مجرد شخص فضولي، فهذه الأداة تمنحك القوة لإنشاء صور مذهلة. إليك كيفية البدء:</p>
                <h3 className="text-lg font-semibold pt-2">الخطوة 1: كتابة وصف (Prompt) فعال</h3>
                <p>جودة الصورة تعتمد بشكل كبير على جودة الوصف. كلما كنت أكثر تحديدًا، كانت النتيجة أفضل.</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>كن وصفيًا:</strong> بدلاً من "سيارة"، جرب "سيارة رياضية حمراء كلاسيكية تسير على طريق ساحلي عند غروب الشمس".</li>
                    <li><strong>حدد النمط:</strong> أضف كلمات مثل "نمط كرتوني"، "واقعي للغاية"، "فن تجريدي"، "لوحة زيتية".</li>
                    <li><strong>اذكر الألوان والإضاءة:</strong> "ألوان نيون ساطعة"، "إضاءة درامية"، "ألوان باستيل هادئة".</li>
                </ul>
                <h3 className="text-lg font-semibold pt-2">الخطوة 2: اختيار نسبة الأبعاد المناسبة</h3>
                <p>تؤثر نسبة الأبعاد على تكوين الصورة. اختر ما يناسب غرضك:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>1:1 (مربع):</strong> مثالي لصور البروفايل ومنشورات انستغرام.</li>
                    <li><strong>16:9 (عريض):</strong> رائع للصور المصغرة لفيديوهات يوتيوب أو خلفيات الشاشة.</li>
                    <li><strong>9:16 (طولي):</strong> مناسب لقصص انستغرام أو سناب شات.</li>
                </ul>
                 <h3 className="text-lg font-semibold pt-2">الخطوة 3: التجربة هي المفتاح</h3>
                <p>لا تتردد في تجربة أوصاف مختلفة. غير كلمة واحدة أو أضف تفصيلاً جديدًا وشاهد كيف تتغير النتيجة. الإبداع لا حدود له!</p>
            </div>
        )
    },
    {
        id: 'website-gen-guide',
        title: 'من فكرة إلى موقع ويب متكامل في دقائق',
        category: 'شرح أداة',
        summary: 'اكتشف كيف يمكنك بناء مواقع ويب كاملة بمجرد كتابة وصف. أداة توليد المواقع تجعل البرمجة في متناول الجميع.',
        content: (
             <div className="space-y-4">
                <p>هل حلمت يومًا ببناء موقع ويب ولكنك لا تملك خبرة في البرمجة؟ أداة توليد المواقع تجعل هذا الحلم حقيقة. يمكنك الآن وصف فكرتك، وسيقوم الذكاء الاصطناعي بكتابة الكود لك.</p>
                <h3 className="text-lg font-semibold pt-2">الخطوة 1: صياغة فكرة واضحة</h3>
                <p>ابدأ بوصف واضح ومفصل للموقع الذي تريده. كلما زادت التفاصيل، كان الموقع أقرب إلى رؤيتك.</p>
                <p><strong>مثال:</strong> "أنشئ صفحة هبوط لتطبيق جوال متخصص في التأمل، يجب أن تحتوي على قسم رئيسي جذاب، وقسم للميزات، وقسم لشهادات العملاء، وقسم للأسعار."</p>
                <h3 className="text-lg font-semibold pt-2">الخطوة 2: اختيار التقنية المناسبة</h3>
                <p>توفر الأداة خيارات تقنية مختلفة لتناسب احتياجاتك:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>HTML + Tailwind CSS:</strong> الخيار الأفضل للحصول على تصميم عصري وسريع. ينتج ملف HTML واحد جاهز للاستخدام.</li>
                    <li><strong>HTML + Inline CSS:</strong> خيار بسيط ومباشر. كل التنسيقات تكون داخل ملف HTML واحد.</li>
                    <li><strong>React + Tailwind CSS:</strong> للمطورين الذين يرغبون في دمج الكود المولد في مشاريع React الحالية.</li>
                </ul>
                 <h3 className="text-lg font-semibold pt-2">الخطوة 3: التوليد والمعاينة</h3>
                <p>بعد كتابة الوصف واختيار التقنية، اضغط على "توليد". سيظهر الكود المصدري ويمكنك معاينته مباشرة في المتصفح. يمكنك نسخ هذا الكود واستخدامه في أي مكان!</p>
            </div>
        )
    },
    {
        id: 'image-vs-video',
        title: 'مقارنة: توليد الصور مقابل الفيديو',
        category: 'مقارنة',
        summary: 'كلتا الأداتين تحولان النص إلى محتوى مرئي، لكنهما تخدمان أغراضًا مختلفة. اكتشف الفروقات الرئيسية واختر الأنسب لمشروعك.',
        content: (
            <div className="space-y-4">
                <p>تعد أدوات توليد الصور والفيديو من أقوى الميزات في التطبيق، لكن لكل منها نقاط قوة واستخدامات مثالية. دعنا نوضح الفروقات لمساعدتك على الاختيار.</p>
                <h3 className="text-lg font-semibold pt-2">أداة توليد الصور: قوة اللحظة الثابتة</h3>
                <p>استخدمها عندما تحتاج إلى:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>إنشاء فنون مفاهيمية أو رسوم توضيحية.</li>
                    <li>تصميم منشورات فريدة لوسائل التواصل الاجتماعي.</li>
                    <li>الحصول على إلهام بصري لمشروع ما.</li>
                    <li>إنشاء شعارات أو أيقونات بسيطة.</li>
                </ul>
                 <h3 className="text-lg font-semibold pt-2">أداة توليد الفيديو: فن الحركة والسرد</h3>
                <p>استخدمها عندما تريد:</p>
                 <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>إضفاء الحيوية على مشهد أو شخصية.</li>
                    <li>إنشاء مقاطع فيديو قصيرة أو إعلانات.</li>
                    <li>تحويل فكرة إلى قصة متحركة.</li>
                    <li>إنشاء رسوم متحركة بسيطة (GIFs).</li>
                </ul>
                <h3 className="text-lg font-semibold pt-2">الفروقات الرئيسية</h3>
                 <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>الوقت:</strong> توليد الفيديو يستغرق وقتًا أطول بكثير من توليد الصور.</li>
                    <li><strong>التعقيد:</strong> وصف الفيديو قد يحتاج إلى التفكير في الحركة والاتجاه بمرور الوقت.</li>
                    <li><strong>النتيجة:</strong> الصورة هي لقطة واحدة، بينما الفيديو هو سلسلة من اللقطات.</li>
                </ul>
                <p className="pt-2"><strong>نصيحة احترافية:</strong> يمكنك توليد صورة لشخصية معينة ثم استخدام وصف مشابه في أداة الفيديو لمحاولة تحريكها!</p>
            </div>
        )
    }
];

const Blog: React.FC = () => {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    if (selectedArticle) {
        return (
            <div className="flex flex-col h-full overflow-y-auto">
                <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                     <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity">
                        <BackIcon className="w-5 h-5" />
                        العودة إلى كل المقالات
                    </button>
                </div>
                <div className="flex-1 p-4 md:p-6">
                    <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-slate-800 p-6 md:p-8 rounded-lg">
                        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-3 py-1 rounded-full">{selectedArticle.category}</span>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-4 mb-6">{selectedArticle.title}</h1>
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none">
                            {selectedArticle.content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-amber-600 dark:text-amber-300 mb-2 text-center flex items-center justify-center gap-2">
                        <ArticleIcon className="w-6 h-6" />
                        مقالات / مدونة
                    </h2>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        شروحات ومقارنات لمساعدتك على إتقان أدوات الذكاء الاصطناعي.
                    </p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map(article => (
                        <div
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg hover:border-amber-500 dark:hover:border-amber-400 transition-all duration-300 flex flex-col"
                        >
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-full self-start">{article.category}</span>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-3 mb-2 flex-1">{article.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{article.summary}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// FIX: Removed duplicate local declaration of BackIcon to resolve conflict.
// The component is already imported from './icons/BackIcon'.

export default Blog;