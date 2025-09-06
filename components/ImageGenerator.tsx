import React from 'react';
import BackIcon from './icons/BackIcon';

interface ImageGeneratorProps {
  onBack: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
        <div className="p-4 md:p-6 bg-[var(--panel-dark)] backdrop-blur-sm border-b border-[var(--border-color)] flex-shrink-0">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-[var(--neon-cyan)] hover:opacity-80 transition-opacity mb-4">
                    <BackIcon className="w-5 h-5" />
                    العودة إلى الأدوات
                </button>
                <h2 className="text-xl font-bold text-purple-300 mb-2 text-center">
                    توليد الصور عبر Hugging Face
                </h2>
                 <p className="text-center text-sm text-slate-400">
                    استخدم الواجهة المدمجة لنموذج Qwen-Image-Fast لتوليد صور عالية الجودة.
                </p>
            </div>
        </div>
        
        <div className="flex-1 overflow-hidden bg-white">
            <iframe 
                src="https://huggingface.co/spaces/multimodalart/Qwen-Image-Fast" 
                className="w-full h-full"
                style={{border: 'none'}}
                title="مولد الصور Qwen"
            >
            </iframe>
        </div>
    </div>
  );
};

export default ImageGenerator;
