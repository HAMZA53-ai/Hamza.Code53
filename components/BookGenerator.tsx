import React, { useState, useCallback } from 'react';
import { generateBookContent } from '../services/geminiService';
import * as creationsService from '../services/creationsService';
import { BookContent } from '../types';
import Spinner from './Spinner';
import BookIcon from './icons/BookIcon';
import DownloadIcon from './icons/DownloadIcon';
import { amiriFont } from './Amiri-Regular';
import { amiriBoldFont } from './Amiri-Bold';
import ExternalLinkIcon from './icons/ExternalLinkIcon';

// Replaced the fetch-based image loading with a more robust canvas-based method
// to handle cross-origin images from Unsplash reliably and fix "Failed to fetch" errors.
const getImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                // Using JPEG for smaller PDF sizes.
                resolve(canvas.toDataURL('image/jpeg'));
            } else {
                reject(new Error("لا يمكن الوصول إلى سياق الرسم للوحة القماشية."));
            }
        };
        img.onerror = () => {
            reject(new Error("فشل تحميل صورة الغلاف من Unsplash. قد تكون الخدمة غير متاحة مؤقتًا أو تم حظر الطلب من قبل المتصفح."));
        };
        // Add a cache-busting parameter to ensure a fresh image is fetched, especially through redirects.
        img.src = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
    });
};

const generatePlaceholderCover = (title: string): string => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e293b'); // slate-800
    gradient.addColorStop(1, '#475569'); // slate-600
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Title
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 70px serif';
    
    // Basic word wrap for Arabic text
    const words = title.split(' ');
    let line = '';
    const lines = [];
    const maxWidth = width * 0.8;
    
    for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    
    const lineHeight = 90;
    const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((l, i) => {
        ctx.fillText(l, width / 2, startY + i * lineHeight);
    });

    // Author
    ctx.font = '30px serif';
    ctx.fillText('تأليف: الذكاء الاصطناعي', width / 2, height - 150);

    return canvas.toDataURL('image/jpeg');
};


const toArabicNumerals = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).split('').map(digit => arabicNumerals[parseInt(digit, 10)] || digit).join('');
};

const BookGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const [editableBook, setEditableBook] = useState<BookContent | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const creationIdRef = React.useRef<string | null>(null);

    const handleContentChange = (type: 'title' | 'chapterTitle' | 'chapterContent', value: string, chapterIndex?: number) => {
        setEditableBook(prevBook => {
            if (!prevBook) return null;
            const newBook = JSON.parse(JSON.stringify(prevBook));
            if (type === 'title') {
                newBook.title = value;
            } else if (chapterIndex !== undefined) {
                if (type === 'chapterTitle') newBook.chapters[chapterIndex].title = value;
                else if (type === 'chapterContent') newBook.chapters[chapterIndex].content = value;
            }
            return newBook;
        });
    };

    const generatePdf = useCallback(async (content: BookContent) => {
        let coverImageBase64 = '';
        if (content.cover_url) {
            try {
                setStatus('جارٍ تحويل صورة الغلاف...');
                coverImageBase64 = await getImageAsBase64(content.cover_url);
            } catch (imageError) {
                console.warn('Failed to load Unsplash image, generating placeholder cover.', imageError);
                setStatus('فشل تحميل الغلاف، جارٍ إنشاء غلاف بديل...');
                coverImageBase64 = generatePlaceholderCover(content.title);
            }
        } else {
            // Fallback if cover_url is missing for some reason
            coverImageBase64 = generatePlaceholderCover(content.title);
        }
        
        if (!coverImageBase64) {
             throw new Error("فشل إنشاء صورة الغلاف.");
        }
        
        setStatus('جارٍ تجميع الكتاب...');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
        doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
        doc.addFileToVFS('Amiri-Bold.ttf', amiriBoldFont);
        doc.addFont('Amiri-Bold.ttf', 'Amiri', 'bold');
        doc.setFont('Amiri');

        const addFooter = (pageNumber: number) => {
            doc.setFont('Amiri', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('تم إنشاؤه بواسطة ناسج الكتب', 105, 288, { align: 'center', lang: 'ar', direction: 'rtl' });
            doc.text(`صفحة ${toArabicNumerals(pageNumber)}`, 200, 288, { align: 'right', lang: 'ar', direction: 'rtl' });
        };
        
        // Page 1: Cover
        doc.addImage(coverImageBase64, 'JPEG', 0, 0, 210, 297);
        doc.setFillColor(0, 0, 0, 0.5);
        doc.rect(10, 120, 190, 60, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('Amiri', 'bold');
        doc.setFontSize(32);
        doc.text(content.title, 105, 145, { align: 'center', maxWidth: 180, lang: 'ar', direction: 'rtl' });
        doc.setFont('Amiri', 'normal');
        doc.setFontSize(16);
        doc.text('تأليف: الذكاء الاصطناعي', 105, 165, { align: 'center', lang: 'ar', direction: 'rtl' });

        // Content Pages
        content.chapters.forEach((chapter, index) => {
            doc.addPage();
            addFooter(index + 2);
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(24);
            doc.setFont('Amiri', 'bold');
            doc.text(chapter.title, 200, 30, { align: 'right', maxWidth: 180, lang: 'ar', direction: 'rtl' });
            doc.setFont('Amiri', 'normal');
            doc.setFontSize(14);
            doc.text(chapter.content, 200, 50, { align: 'right', lang: 'ar', direction: 'rtl', maxWidth: 180, lineHeightFactor: 1.6 });
        });
        
        return doc.output('blob');
    }, []);

    const handlePdfGeneration = async (action: 'download' | 'preview') => {
        if (!editableBook) return;
        setIsGeneratingPdf(true);
        setError(null);
        setPdfUrl(null);

        try {
            const pdfBlob = await generatePdf(editableBook);
            const dataUrl = URL.createObjectURL(pdfBlob);

            if (action === 'preview') {
                window.open(dataUrl, '_blank');
            } else { // download
                setPdfUrl(dataUrl);

                const reader = new FileReader();
                reader.readAsDataURL(pdfBlob);
                reader.onloadend = () => {
                    if (creationIdRef.current) {
                        creationsService.updateCreation(creationIdRef.current, { status: 'completed', data: reader.result });
                    }
                };

                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `${editableBook.title.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            // It's generally safe to revoke after a short delay
            setTimeout(() => URL.revokeObjectURL(dataUrl), 100);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'فشل إنشاء ملف PDF.';
            setError(errorMessage);
            if (action === 'download' && creationIdRef.current) {
                creationsService.updateCreation(creationIdRef.current, { status: 'failed', error: errorMessage });
            }
        } finally {
            setIsGeneratingPdf(false);
            setStatus('');
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('الرجاء إدخال فكرة الكتاب.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditableBook(null);
        setPdfUrl(null);
        
        creationIdRef.current = creationsService.addCreation({ type: 'Book', prompt: topic, status: 'pending' });

        try {
            setStatus('يقوم الذكاء الاصطناعي بتخطيط الكتاب...');
            const bookPlan = await generateBookContent(topic);
            
            setStatus('البحث عن صورة غلاف ملائمة...');
            const query = encodeURIComponent(bookPlan.cover_query.replace(/\s/g, ','));
            const unsplashUrl = `https://source.unsplash.com/800x1200/?${query}`;
            
            setEditableBook({ ...bookPlan, cover_url: unsplashUrl });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(errorMessage);
            if (creationIdRef.current) creationsService.updateCreation(creationIdRef.current, { status: 'failed', error: errorMessage });
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };
    
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-yellow-600 dark:text-yellow-300 mb-2 text-center">ناسج الكتب بالذكاء الاصطناعي</h2>
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="مثال: تاريخ استكشاف الفضاء ورواده الأوائل..."
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
                        rows={2}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !topic.trim()} className="w-full h-10 px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg hover:bg-yellow-400 dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center">
                        {isLoading ? status : 'نسج الكتاب'}
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
                        <Spinner />
                        <p className="mt-4 text-lg">{status}</p>
                    </div>
                )}
                {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg">{error}</p>}
                
                {!isLoading && !error && editableBook && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <div className="relative aspect-[2/3] max-w-sm mx-auto rounded-lg shadow-2xl overflow-hidden mb-6">
                                <img src={editableBook.cover_url} alt="غلاف الكتاب" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-0 p-6 text-white w-full">
                                    <h1 contentEditable suppressContentEditableWarning onBlur={(e) => handleContentChange('title', e.currentTarget.innerText)} className="text-3xl font-bold leading-tight" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{editableBook.title}</h1>
                                </div>
                            </div>
                        </div>

                        {editableBook.chapters.map((chapter, index) => (
                            <div key={index} className="bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h2 contentEditable suppressContentEditableWarning onBlur={(e) => handleContentChange('chapterTitle', e.currentTarget.innerText, index)} className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b-2 border-yellow-500">{chapter.title}</h2>
                                <div contentEditable suppressContentEditableWarning onBlur={(e) => handleContentChange('chapterContent', e.currentTarget.innerText, index)} className="text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{chapter.content}</div>
                            </div>
                        ))}

                        <div className="text-center pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button onClick={() => handlePdfGeneration('download')} disabled={isGeneratingPdf} className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-semibold disabled:bg-slate-400">
                                {isGeneratingPdf ? <><Spinner/> {status || 'جارٍ الإنشاء...'}</> : <><DownloadIcon className="w-5 h-5" /> تصدير كـ PDF</>}
                            </button>
                             <button onClick={() => handlePdfGeneration('preview')} disabled={isGeneratingPdf} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors font-semibold disabled:bg-slate-400">
                                <ExternalLinkIcon className="w-5 h-5" />
                                معاينة خارجية
                            </button>
                        </div>
                         {pdfUrl && <p className="text-center text-sm text-green-600 dark:text-green-400 mt-4">تم تحميل ملف PDF بنجاح!</p>}
                    </div>
                )}
                
                {!isLoading && !editableBook && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <BookIcon className="w-24 h-24 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">حوّل فكرة إلى كتاب كامل</h3>
                        <p>اكتب موضوعًا في الأعلى، ودع الذكاء الاصطناعي ينسج لك كتابًا بغلاف ومحتوى وتصميم أنيق.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookGenerator;