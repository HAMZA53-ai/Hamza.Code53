import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import PaperclipIcon from './icons/PaperclipIcon';
import SendIcon from './icons/SendIcon';
import { ChatMode } from '../types';
import SearchIcon from './icons/SearchIcon';
import BrainIcon from './icons/BrainIcon';
import ZapIcon from './icons/ZapIcon';
import BookOpenIcon from './icons/BookOpenIcon';

interface ChatInputProps {
  onSend: (text: string, image?: { data: string; mimeType: string }) => void;
  disabled: boolean;
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, chatMode, setChatMode }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);


  const handleSend = () => {
    if ((text.trim() || image) && !disabled) {
      if (image) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = (e.target?.result as string).split(',')[1];
          onSend(text.trim(), { data: base64Data, mimeType: image.file.type });
          setText('');
          setImage(null);
        };
        reader.readAsDataURL(image.file);
      } else {
        onSend(text.trim());
        setText('');
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setImage({ file, preview: URL.createObjectURL(file) });
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImage({ file, preview: URL.createObjectURL(file) });
      }
    }
  };

  const ModeButton: React.FC<{
    mode: ChatMode;
    label: string;
    children: React.ReactNode;
  }> = ({ mode, label, children }) => (
    <button
      type="button"
      onClick={() => setChatMode(mode)}
      disabled={disabled}
      className={`flex-1 flex flex-col items-center justify-center p-1 rounded-lg transition-all text-xs duration-200 ${
        chatMode === mode 
          ? 'bg-[var(--neon-cyan)] text-black shadow-[var(--glow-active)] font-bold' 
          : 'text-slate-400 hover:bg-[var(--panel-interactive-hover)] hover:text-slate-200'
      }`}
      title={label}
    >
      {children}
      <span className="mt-0.5">{label}</span>
    </button>
  );

  return (
    <div 
        className="w-full max-w-4xl mx-auto relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
        {isDragging && (
            <div className="absolute inset-0 bg-[var(--panel-dark)]/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-20 border-2 border-dashed border-[var(--neon-cyan)]">
                <p className="text-lg font-bold text-[var(--neon-cyan)] [text-shadow:var(--glow-cyan-light)]">أفلت الصورة هنا لإرفاقها</p>
            </div>
        )}
      {image && (
        <div className="mb-2 p-2 bg-[var(--panel-dark)] border border-[var(--border-color)] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={image.preview} alt="Preview" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md" />
            <span className="text-sm text-slate-300 truncate">{image.file.name}</span>
          </div>
          <button
            onClick={() => setImage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800 hover:bg-slate-600 transition-colors flex-shrink-0"
          >
            &#x2715;
          </button>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 mb-2">
        <ModeButton mode="google_search" label="بحث جوجل"><SearchIcon className="w-5 h-5" /></ModeButton>
        <ModeButton mode="default" label="تفكير افتراضي"><BrainIcon className="w-5 h-5" /></ModeButton>
        <ModeButton mode="quick_response" label="رد سريع"><ZapIcon className="w-5 h-5" /></ModeButton>
        <ModeButton mode="learning" label="ذاكرة وتعلم"><BookOpenIcon className="w-5 h-5" /></ModeButton>
      </div>
      <div className="flex items-end gap-2 bg-[var(--panel-dark)] border border-[var(--border-color)] rounded-xl p-1 sm:p-2">
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 resize-none outline-none p-2 max-h-24 sm:max-h-40 cyber-scrollbar"
          rows={1}
          disabled={disabled}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-1.5 sm:p-2 text-slate-400 hover:text-[var(--neon-cyan)] disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
          aria-label="إرفاق صورة"
        >
          <PaperclipIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !image)}
          className="p-2 sm:p-3 bg-[var(--neon-cyan)] text-black rounded-lg hover:shadow-[var(--glow-active)] disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
          aria-label="إرسال رسالة"
        >
          <SendIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;