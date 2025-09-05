import React, { useState } from 'react';

interface SettingsProps {
  currentUserName: string;
  onUpdateUserName: (name: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUserName, onUpdateUserName }) => {
  const [name, setName] = useState(currentUserName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== currentUserName) {
      onUpdateUserName(name.trim());
      // A more subtle confirmation could be used, but alert is simple and effective.
      alert('تم تحديث اسمك بنجاح!');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <h2 className="text-xl font-bold text-slate-200 text-center">الإعدادات</h2>

        <div className="bg-[var(--panel-dark)] backdrop-blur-sm p-6 rounded-lg border border-[var(--border-color)]">
          <h3 className="font-semibold text-slate-200 mb-4">ملف المستخدم</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>
    </div>
  );
};

export default Settings;