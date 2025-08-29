import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import PaperclipIcon from './icons/PaperclipIcon';
import SendIcon from './icons/SendIcon';

interface ChatInputProps {
  onSend: (text: string, image?: { data: string; mimeType: string }) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setImage({ file, preview: URL.createObjectURL(file) });
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {image && (
        <div className="mb-2 p-2 bg-slate-200 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={image.preview} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
            <span className="text-sm text-slate-600 dark:text-slate-300">{image.file.name}</span>
          </div>
          <button
            onClick={() => setImage(null)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-full bg-slate-300 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
          >
            &#x2715;
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-2xl p-2">
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-none outline-none p-2 max-h-40"
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
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
          aria-label="Attach image"
        >
          <PaperclipIcon className="w-6 h-6" />
        </button>
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !image)}
          className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;