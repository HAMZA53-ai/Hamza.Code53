
import React, { useState } from 'react';
import { ToolSettings, WebTechStack, QuizType } from '../types';
import * as toolSettingsService from '../services/toolSettingsService';

interface SettingsProps {
  currentUserName: string;
  onUpdateUserName: (name: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUserName, onUpdateUserName }) => {
  const [name, setName] = useState(currentUserName);
  const [toolSettings, setToolSettings] = useState<ToolSettings>(() => toolSettingsService.getToolSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const languages = ['Arabic', 'English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Russian'];


  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== currentUserName) {
      onUpdateUserName(name.trim());
      alert('تم تحديث اسمك بنجاح!');
    }
  };
  
  const handleToolSettingsChange = (tool: keyof ToolSettings, setting: string, value: any) => {
    setToolSettings(prev => ({
      ...prev,
      [tool]: {
        ...(prev[tool] as object), // Cast to object to satisfy spread syntax
        [setting]: value,
      }
    }));
  };

  const handleToolSettingsSave = () => {
    toolSettingsService.saveToolSettings(toolSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };


  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6 cyber-scrollbar">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <h2 className="text-xl font-bold text-slate-200 text-center">الإعدادات</h2>

        <div className="bg-[var(--panel-dark)] backdrop-blur-sm p-6 rounded-lg border border-[var(--border-color)]">
          <h3 className="font-semibold text-slate-200 mb-4">ملف المستخدم</h3>
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-400 mb-2">
                اسم المستخدم
              </label>
              <input
                id="username"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/50 border border-[var(--border-color)] rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-[var(--neon-cyan)] focus:shadow-[var(--glow-active)] focus:outline-none transition-all duration-300"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!name.trim() || name.trim() === currentUserName}
                className="px-5 py-2 bg-[var(--neon-cyan)] text-black rounded-lg hover:shadow-[var(--glow-active)] disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all font-semibold"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>

        <div className="bg-[var(--panel-dark)] backdrop-blur-sm p-6 rounded-lg border border-[var(--border-color)]">
          <h3 className="font-semibold text-slate-200 mb-4">إعدادات الأدوات الافتراضية</h3>
          <div className="space-y-6">
            
            {/* Image Generator */}
            <div>
              <h4 className="text-slate-300 font-medium mb-3 border-b border-slate-700 pb-2">مولد الصور</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="img-aspect" className="block text-sm text-slate-400 mb-2">نسبة الأبعاد</label>
                  <select id="img-aspect" value={toolSettings.imageGenerator?.aspectRatio || '1:1'} onChange={(e) => handleToolSettingsChange('imageGenerator', 'aspectRatio', e.target.value)} className="w-full bg-slate-800/50 border border-[var(--border-color)] rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-[var(--neon-cyan)] focus:outline-none">
                    <option value="1:1">مربع (1:1)</option>
                    <option value="16:9">عريض (16:9)</option>
                    <option value="9:16">طولي (9:16)</option>
                    <option value="4:3">أفقي (4:3)</option>
                    <option value="3:4">عمودي (3:4)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="img-count" className="block text-sm text-slate-400 mb-2">عدد الصور</label>
                  <select id="img-count" value={toolSettings.imageGenerator?.numberOfImages || 1} onChange={(e) => handleToolSettingsChange('imageGenerator', 'numberOfImages', parseInt(e.target.value))} className="w-full bg-slate-800/50 border border-[var(--border-color)] rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-[var(--neon-cyan)] focus:outline-none">
                    <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Website Generator */}
             <div>
              <h4 className="text-slate-300 font-medium mb-3 border-b border-slate-700 pb-2">مولد المواقع</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="web-lang" className="block text-sm text-slate-400 mb-2">لغة الموقع</label>
                  <select id="web-lang" value={toolSettings.websiteGenerator?.language || 'Arabic'} onChange={(e) => handleToolSettingsChange('websiteGenerator', 'language', e.target.value)} className="w-full bg-slate-800/50 border border-[var(--border-color)] rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-[var(--neon-cyan)] focus:outline-none">
                     {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="web-tech" className="block text-sm text-slate-400 mb-2">التقنية المستخدمة</label>
                  <select id="web-tech" value={toolSettings.websiteGenerator?.techStack || 'tailwind'} onChange={(e) => handleToolSettingsChange('websiteGenerator', 'techStack', e.target.value as WebTechStack)} className="w-full bg-slate-800/50 border border-[var(--border-color)] rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-[var(--neon-cyan)] focus:outline-none">
                    <option value="tailwind">HTML + Tailwind CSS</option>
                    <option value="html-css">HTML + Inline CSS</option>
                    <option value="react-tailwind">React + Tailwind CSS</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quiz Generator */}
             <div>
              <h4 className="text-slate-300 font-medium mb-3 border-b border-slate-700 pb-2">مولد الاختبارات</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="quiz-type" className="block text-sm text-slate-400 mb-2">نوع الأسئلة</label>
                  <select id="quiz-type" value={toolSettings.quizGenerator?.quizType || 'multiple-choice'} onChange={(e) => handleToolSettingsChange('quizGenerator', 'quizType', e.target.value as QuizType)} className="w-full bg-slate-800/50 border border-[var(--border-color)] rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-[var(--neon-cyan)] focus:outline-none">
                    <option value="multiple-choice">اختيار من متعدد</option>
                    <option value="true-false">صح / خطأ</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="quiz-count" className="block text-sm text-slate-400 mb-2">عدد الأسئلة</label>
                  <input type="number" id="quiz-count" min="1" max="15" value={toolSettings.quizGenerator?.questionCount || 5} onChange={(e) => handleToolSettingsChange('quizGenerator', 'questionCount', parseInt(e.target.value))} className="w-full bg-slate-800/50 border border-[var(--border-color)] rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-[var(--neon-cyan)] focus:outline-none" />
                </div>
              </div>
            </div>
            
             {/* Logo Generator */}
             <div>
              <h4 className="text-slate-300 font-medium mb-3 border-b border-slate-700 pb-2">مولد الشعارات</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="logo-style" className="block text-sm text-slate-400 mb-2">نمط الشعار</label>
                  <select id="logo-style" value={toolSettings.logoGenerator?.style || 'minimalist'} onChange={(e) => handleToolSettingsChange('logoGenerator', 'style', e.target.value)} className="w-full bg-slate-800/50 border border-[var(--border-color)] rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-[var(--neon-cyan)] focus:outline-none">
                    <option value="minimalist">بسيط (Minimalist)</option>
                    <option value="modern">حديث (Modern)</option>
                    <option value="vintage">عتيق (Vintage)</option>
                    <option value="geometric">هندسي (Geometric)</option>
                    <option value="abstract">تجريدي (Abstract)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Translation */}
             <div>
              <h4 className="text-slate-300 font-medium mb-3 border-b border-slate-700 pb-2">الترجمة</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="trans-lang" className="block text-sm text-slate-400 mb-2">الترجمة إلى</label>
                  <select id="trans-lang" value={toolSettings.translationSummarization?.targetLanguage || 'English'} onChange={(e) => handleToolSettingsChange('translationSummarization', 'targetLanguage', e.target.value)} className="w-full bg-slate-800/50 border border-[var(--border-color)] rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-[var(--neon-cyan)] focus:outline-none">
                     {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>
              </div>
            </div>

          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleToolSettingsSave}
              className="px-5 py-2 bg-[var(--neon-cyan)] text-black rounded-lg hover:shadow-[var(--glow-active)] disabled:opacity-50 transition-all font-semibold"
            >
              {saveSuccess ? 'تم الحفظ!' : 'حفظ إعدادات الأدوات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
