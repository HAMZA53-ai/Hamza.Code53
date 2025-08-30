import React, { useState, useRef, useCallback } from 'react';
import Spinner from './Spinner';
import BackIcon from './icons/BackIcon';
import ImageIcon from './icons/ImageIcon';
import CameraIcon from './icons/CameraIcon';
import { editImage } from '../services/geminiService';
import * as creationsService from '../services/creationsService';

type EditMode = 'upscale' | 'cartoonify' | 'background-remove' | 'custom';

interface ImageEditorToolProps {
  title: string;
  icon: React.ReactNode;
  onBack: () => void;
  editMode: EditMode;
}

const getPromptForMode = (mode: EditMode, customPrompt: string): string => {
    switch (mode) {
        case 'upscale': return 'Upscale this image to a higher resolution, enhance details, and improve overall quality.';
        case 'cartoonify': return 'Convert this image into a cartoon or anime style.';
        case 'background-remove': return 'Remove the background from this image, leaving only the main subject with a transparent background.';
        case 'custom': return customPrompt;
        default: return customPrompt;
    }
}

const ImageEditorTool: React.FC<ImageEditorToolProps> = ({ title, icon, onBack, editMode }) => {
    const [originalImage, setOriginalImage] = useState<{ file: File, preview: string } | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [customPrompt, setCustomPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setOriginalImage({ file, preview: URL.createObjectURL(file) });
            setEditedImage(null);
            setError(null);
        } else {
            setError('الرجاء تحديد ملف صورة صالح.');
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-teal-500');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('border-teal-500');
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-teal-500');
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCapturing(true);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الأذونات.");
        }
    };
    
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        setIsCapturing(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context?.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
            
            canvasRef.current.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
                    handleFileChange(file);
                }
                stopCamera();
            }, 'image/png');
        }
    };

    const handleSubmit = async () => {
        if (!originalImage) {
            setError('الرجاء رفع صورة أولاً.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        const reader = new FileReader();
        reader.readAsDataURL(originalImage.file);
        reader.onload = async (e) => {
             const creationId = creationsService.addCreation({
                type: 'EditedImage',
                prompt: title, // Using the tool title as a generic prompt
                status: 'pending',
            });
            try {
                const base64Data = (e.target?.result as string).split(',')[1];
                const mimeType = originalImage.file.type;
                const prompt = getPromptForMode(editMode, customPrompt);

                const resultBase64 = await editImage(base64Data, mimeType, prompt);
                const finalImage = `data:image/png;base64,${resultBase64}`;
                setEditedImage(finalImage);
                creationsService.updateCreation(creationId, {
                    status: 'completed',
                    data: finalImage,
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
        reader.onerror = () => {
            setError("فشل في قراءة ملف الصورة.");
            setIsLoading(false);
        };
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
                <div className="max-w-6xl mx-auto space-y-6">
                    {!originalImage && !isCapturing && (
                        <div 
                            onDrop={handleDrop} 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center transition-colors"
                        >
                            <ImageIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">اسحب وأفلت صورة هنا</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">أو</p>
                            <div className="flex justify-center gap-4 mt-4">
                                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-semibold text-sm">اختر ملفًا</button>
                                <button onClick={startCamera} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 font-semibold text-sm flex items-center gap-2"><CameraIcon className="w-5 h-5"/> استخدم الكاميرا</button>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} className="hidden" accept="image/*" />
                        </div>
                    )}

                    {isCapturing && (
                        <div className="flex flex-col items-center gap-4">
                            <video ref={videoRef} autoPlay className="w-full max-w-md rounded-lg" />
                            <div className="flex gap-4">
                               <button onClick={capturePhoto} className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-500 font-bold text-sm">التقط صورة</button>
                               <button onClick={stopCamera} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 font-semibold text-sm">إلغاء</button>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    )}

                    {originalImage && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div className="text-center">
                                    <h3 className="font-semibold mb-2">الصورة الأصلية</h3>
                                    <img src={originalImage.preview} alt="Original" className="rounded-lg max-h-80 mx-auto" />
                                    <button onClick={() => setOriginalImage(null)} className="mt-2 text-sm text-red-500 hover:underline">تغيير الصورة</button>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold mb-2">الصورة المعدلة</h3>
                                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                        {isLoading ? <Spinner /> : editedImage ? <img src={editedImage} alt="Edited" className="rounded-lg max-h-80 mx-auto" /> : <p className="text-slate-500">النتيجة ستظهر هنا</p>}
                                    </div>
                                </div>
                            </div>
                             {editMode === 'custom' && (
                                <textarea
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="اكتب تعليمات التعديل هنا (مثال: أضف قبعة قرصان على رأسه)"
                                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-y focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                                    rows={3}
                                    disabled={isLoading}
                                />
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full h-12 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                            >
                                {isLoading ? 'جارٍ التعديل...' : 'نفّذ التعديل'}
                            </button>
                        </>
                    )}
                    
                    {error && <p className="mt-4 text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/20 p-3 rounded-lg">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ImageEditorTool;
