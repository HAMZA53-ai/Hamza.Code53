
import React, { useState } from 'react';
import { generateImages } from '../services/aiService';
import * as creationsService from '../services/creationsService';
import Spinner from './Spinner';
import DownloadIcon from './icons/DownloadIcon';
import ImageIcon from './icons/ImageIcon';
import ImageModal from './ImageModal';
import ExternalLinkIcon from './icons/ExternalLinkIcon';
import BackIcon from './icons/BackIcon';

type AspectRatio = "1:1" | "9:16" | "16:9" | "4:3" | "3:4";

interface ImageGeneratorProps {
  onBack: () => void;
}

const addWatermarkToImage = (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        const fontSize = Math.max(16, Math.min(img.width, img.height) * 0.04);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 5;

        ctx.fillText('حمزة سوبر', canvas.width - 15, canvas.height - 15);
        resolve(canvas.toDataURL('image/jpeg'));
      } else {
        reject(new Error("Could not get canvas context"));
      }
    };
    img.onerror = () => {
        reject(new Error("Failed to load image for watermarking"));
    };
    img.src = base64Image;
  });
};


const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submittedPrompt, setSubmittedPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('الرجاء إدخال وصف للصورة.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImages([]);
    setSubmittedPrompt(prompt);

    const creationId = creationsService.addCreation({
      type: 'Image',
      prompt,
      status: 'pending',
    });

    try {
      const generated = await generateImages(prompt, numberOfImages, aspectRatio);
      const watermarkedImages = await Promise.all(
        generated.map(img => addWatermarkToImage(img))
      );
      setImages(watermarkedImages);
      creationsService.updateCreation(creationId, {
        status: 'completed',
        data: watermarkedImages,
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
  
  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${prompt.substring(0, 20).replace(/\s+/g, '_')}_${Date.now()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
    {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
    <div className="flex flex-col h-full overflow-hidden">
        <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
            <div className="max-w-4xl mx-auto">
                 <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity mb-4">
                    <BackIcon className="w-5 h-5" />
                    العودة إلى الأدوات
                </button>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                     <h2 className="text-xl font-bold text-purple-600 dark:text-purple-300 mb-2 text-center">توليد الصور بالذكاء الاصطناعي</h2>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="مثال: قطة ترتدي نظارات شمسية وتقود دراجة نارية في الفضاء..."
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        rows={3}
                        disabled={isLoading}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">نسبة الأبعاد</label>
                            <select
                                id="aspectRatio"
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                                disabled={isLoading}
                                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            >
                                <option value="1:1">مربع (1:1)</option>
                                <option value="16:9">عريض (16:9)</option>
                                <option value="9:16">طولي (9:16)</option>
                                <option value="4:3">أفقي (4:3)</option>
                                <option value="3:4">عمودي (3:4)</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="numberOfImages" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">عدد الصور</label>
                            <select
                                id="numberOfImages"
                                value={numberOfImages}
                                onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
                                disabled={isLoading}
                                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="md:self-end w-full h-10 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                        >
                            {isLoading ? 'جارٍ التوليد...' : 'توليد'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {isLoading && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
                    <Spinner />
                    <p className="mt-4">يقوم الذكاء الاصطناعي برسم تحفتك الفنية...</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">قد يستغرق هذا بضع لحظات.</p>
                </div>
            )}
            {error && <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg">{error}</p>}
            {images.length > 0 && (
                <div className="max-w-7xl mx-auto">
                    <div className="mb-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500 dark:text-slate-400">النتيجة للوصف:</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{submittedPrompt}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {images.map((imgSrc, index) => (
                            <div key={index} className="relative group bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg cursor-pointer" onClick={() => setSelectedImage(imgSrc)}>
                               <img src={imgSrc} alt={`Generated image ${index + 1} for prompt: ${prompt}`} className="w-full object-contain" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDownload(imgSrc); }}
                                        className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur-sm"
                                        aria-label="Download image"
                                        title="تحميل الصورة"
                                    >
                                        <DownloadIcon className="w-6 h-6" />
                                    </button>
                                    <a
                                        href={imgSrc}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur-sm"
                                        aria-label="Open image in new tab"
                                        title="معاينة خارجية"
                                    >
                                        <ExternalLinkIcon className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
             {!isLoading && images.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                    <ImageIcon className="w-24 h-24 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">مساحة إبداعك</h3>
                    <p>اكتب وصفاً في الأعلى ودع الذكاء الاصطناعي يحوله إلى صورة.</p>
                </div>
             )}
        </div>
    </div>
    </>
  );
};

export default ImageGenerator;
