import React, { useState } from 'react';
import HexagonIcon from './icons/HexagonIcon';
import { saveGeminiApiKey } from '../services/apiKeyService';

interface WelcomeScreenProps {
  onSetName: (name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSetName }) => {
  const [name, setName] = useState('');

  const handleActivationAndStart = () => {
    // This is a free, demo key as per user's personal project request.
    const freeKey = "AIzaSyCv7oFzh2qFMjm92ZmVIzI_BArQYWgSTeM";
    saveGeminiApiKey(freeKey);
    
    const userName = name.trim();
    if(userName) {
        onSetName(userName);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && name.trim()) {
      handleActivationAndStart();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-transparent text-slate-200 font-sans p-4">
      <div className="text-center p-6 sm:p-8 max-w-md w-full bg-[var(--panel-dark)] backdrop-blur-md rounded-lg border border-[var(--border-color)]">
        <HexagonIcon className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--neon-cyan)] mx-auto mb-6" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[var(--neon-cyan)] [text-shadow:var(--glow-cyan)]">أهلاً بك في MZ</h1>
        <p className="text-slate-400 mb-6">مساعدك الشخصي الفائق. لنبدأ، ما هو اسمك؟</p>
        <p className="text-xs text-slate-500 mb-8">
          انا نموذج كبير برمجني حمزة محمد الحسيني و طورني حمزة محمد سعيد
        </p>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="ادخل اسمك هنا"
            className="w-full bg-slate-800/50 border border-[var(--border-color)] rounded-lg p-3 sm:p-4 text-center text-base sm:text-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-[var(--neon-cyan)] focus:border-[var(--neon-cyan)] focus:outline-none transition"
            autoFocus
          />
          <button
            onClick={handleActivationAndStart}
            disabled={!name.trim()}
            className="w-full h-11 sm:h-12 px-4 py-2 bg-[var(--neon-cyan)] text-black rounded-lg hover:shadow-[var(--glow-active)] disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all font-semibold text-base sm:text-lg"
          >
            بدء الدردشة
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
