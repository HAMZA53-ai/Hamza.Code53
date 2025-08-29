import React, { useState, useEffect } from 'react';
import * as geminiService from '../services/geminiService';
import * as apiKeyService from '../services/apiKeyService';
import Spinner from './Spinner';

interface SettingsProps {
  currentTheme: 'light' | 'dark';
  onSetTheme: (theme: 'light' | 'dark') => void;
  isDevMode: boolean;
  onSetDevMode: (enabled: boolean) => void;
}

type ApiCheckStatus = 'idle' | 'loading' | 'success' | 'error';

const Settings: React.FC<SettingsProps> = ({ currentTheme, onSetTheme, isDevMode, onSetDevMode }) => {
  const isDark = currentTheme === 'dark';
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiCheckStatus>('idle');
  const [apiKeyMessage, setApiKeyMessage] = useState<string>('');
  
  useEffect(() => {
    const storedKey = apiKeyService.getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const toggleTheme = () => {
    onSetTheme(isDark ? 'light' : 'dark');
  };

  const toggleDevMode = () => {
    onSetDevMode(!isDevMode);
  };
  
  const handleCheckApiKey = async () => {
    setApiKeyStatus('loading');
    setApiKeyMessage('');
    const result = await geminiService.checkApiKeyStatus();
    setApiKeyMessage(result.message);
    setApiKeyStatus(result.success ? 'success' : 'error');
  };

  const handleSaveKey = () => {
    apiKeyService.saveApiKey(apiKey);
    handleCheckApiKey(); // Automatically check the key after saving
  };
  
  const handleClearKey = () => {
    apiKeyService.clearApiKey();
    setApiKey('');
    setApiKeyStatus('idle');
    setApiKeyMessage('تم حذف مفتاح API.');
  };

  const getStatusColor = () => {
    if (apiKeyStatus === 'success') return 'text-green-600 dark:text-green-400';
    if (apiKeyStatus === 'error') return 'text-red-600 dark:text-red-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center">الإعدادات</h2>
        
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg mb-4">مفتاح Google Gemini API</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            لضمان عمل جميع الميزات، يرجى إدخال مفتاح API الخاص بك من Google AI Studio. سيتم حفظ المفتاح بأمان في متصفحك فقط.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 items-start">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setApiKeyStatus('idle'); }}
              placeholder="أدخل مفتاح API الخاص بك هنا"
              className="flex-grow w-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button onClick={handleSaveKey} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-semibold text-sm">حفظ والتحقق</button>
              <button onClick={handleClearKey} className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold text-sm">حذف</button>
            </div>
          </div>
          <div className="mt-3 min-h-[20px]">
            {apiKeyStatus === 'loading' && <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-teal-500"></div>}
            {apiKeyMessage && (<p className={`text-sm ${getStatusColor()}`}>{apiKeyMessage}</p>)}
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">المظهر</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">اختر بين المظهر الفاتح أو الداكن.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              style={{ backgroundColor: isDark ? '#34D399' : '#A0AEC0' }}
            >
              <span
                className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300"
                style={{ transform: isDark ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">وضع المطور</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">إظهار معلومات إضافية للتصحيح.</p>
            </div>
            <button
              onClick={toggleDevMode}
              className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              style={{ backgroundColor: isDevMode ? '#34D399' : '#A0AEC0' }}
            >
              <span
                className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300"
                style={{ transform: isDevMode ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
