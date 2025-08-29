import React from 'react';
import { Conversation, MessagePart, View } from '../types';
import NewChatIcon from './icons/NewChatIcon';
import DeleteIcon from './icons/DeleteIcon';
import { formatTimestamp } from '../utils/dateFormatter';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import HistoryIcon from './icons/HistoryIcon';
import ImageIcon from './icons/ImageIcon';
import VideoIcon from './icons/VideoIcon';
import WebsiteIcon from './icons/WebsiteIcon';
import BookIcon from './icons/BookIcon';
// FIX: Import MessengerIcon for the new section.
import MessengerIcon from './icons/MessengerIcon';
import CreationsIcon from './icons/CreationsIcon';
import SettingsIcon from './icons/SettingsIcon';


interface HistorySidebarProps {
  history: Conversation[];
  currentChatId: string | null;
  onNewChat: () => void;
  onLoadChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  closeSidebar: () => void;
  onSetView: (view: View) => void;
  currentView: View;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  currentChatId,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  isOpen,
  closeSidebar,
  onSetView,
  currentView,
}) => {

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent onLoadChat from firing
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه المحادثة؟')) {
      onDeleteChat(id);
    }
  };

  const getPreviewText = (parts: MessagePart[]): string => {
    const textPart = parts.find(p => p.type === 'text');
    if (textPart && 'text' in textPart) {
      return textPart.text;
    }
    const imagePart = parts.find(p => p.type === 'image');
    if (imagePart) {
      return 'صورة';
    }
    return '...';
  }

  const getButtonClass = (view: View) => {
    const baseClass = "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors w-full text-right";
    const textClass = 'text-slate-700 dark:text-slate-200';
    const activeClass = currentView === view ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : '';
    
    return `${baseClass} ${textClass} ${activeClass}`;
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-20 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      ></div>

      <aside
        className={`flex flex-col h-full bg-slate-100 dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex-shrink-0 z-30 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72 lg:w-80' : 'w-0'}
        lg:static absolute right-0 top-0 overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex flex-col gap-2 flex-shrink-0 min-w-[17rem] lg:min-w-[19rem]">
            <button
              onClick={() => onSetView('chat')}
              className={getButtonClass('chat')}
              title="محادثة"
            >
              <NewChatIcon className="w-5 h-5 text-teal-500 dark:text-teal-400" />
              <span>محادثة</span>
            </button>
            {/* FIX: Add button for the new Messenger view. */}
            <button
              onClick={() => onSetView('messenger')}
              className={getButtonClass('messenger')}
              title="ماسنجر"
            >
              <MessengerIcon className="w-5 h-5 text-pink-500 dark:text-pink-400" />
              <span>ماسنجر</span>
            </button>
            <button
              onClick={() => onSetView('image')}
              className={getButtonClass('image')}
              title="توليد الصور"
            >
              <ImageIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <span>صور</span>
            </button>
            <button
              onClick={() => onSetView('video')}
              className={getButtonClass('video')}
              title="توليد الفيديو"
            >
              <VideoIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span>فيديو</span>
            </button>
            <button
              onClick={() => onSetView('website')}
              className={getButtonClass('website')}
              title="توليد موقع ويب"
            >
              <WebsiteIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span>موقع ويب</span>
            </button>
            <button
              onClick={() => onSetView('book')}
              className={getButtonClass('book')}
              title="ناسج الكتب"
            >
              <BookIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              <span>كتاب</span>
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 min-w-[17rem] lg:min-w-[19rem]">
            <h3 className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">سجل المحادثات</h3>
            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
                    <HistoryIcon className="w-16 h-16 mb-4" />
                    <h3 className="font-semibold text-slate-600 dark:text-slate-400">لا يوجد سجل</h3>
                    <p className="text-sm">ابدأ محادثة جديدة لرؤيتها هنا.</p>
                </div>
            ) : (
                <ul>
                {history.map((chat) => {
                    const lastMessage = chat.messages[chat.messages.length - 1];
                    const previewText = lastMessage ? getPreviewText(lastMessage.parts) : '...';
                    const isChatActive = currentView === 'chat' && currentChatId === chat.id;

                    return (
                    <li key={chat.id}>
                        <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onLoadChat(chat.id);
                        }}
                        className={`group flex items-center gap-3 p-3 my-1 rounded-lg transition-colors text-right relative overflow-hidden ${
                            isChatActive
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                            : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                        }`}
                        >
                        {isChatActive && (
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-teal-500 dark:bg-teal-400 rounded-r-sm"></div>
                        )}

                        <ChatBubbleIcon className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />

                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm truncate">{chat.title}</p>
                            <span className={`text-xs flex-shrink-0 mr-2 ${
                                isChatActive ? 'text-slate-500 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
                            }`}>
                                {formatTimestamp(chat.timestamp)}
                            </span>
                            </div>
                            <p className={`text-xs mt-1 truncate ${
                            isChatActive ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                            {previewText}
                            </p>
                        </div>

                        <button
                            onClick={(e) => handleDelete(e, chat.id)}
                            className="absolute left-2 top-1/2 -translate-y-12 p-1 opacity-0 group-hover:opacity-100 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all rounded-full focus:opacity-100 bg-slate-200/50 dark:bg-slate-700/50"
                            aria-label="حذف المحادثة"
                        >
                            <DeleteIcon className="w-5 h-5" />
                        </button>
                        </a>
                    </li>
                    );
                })}
                </ul>
            )}
        </div>
        <div className="p-2 border-t border-gray-200 dark:border-slate-700 min-w-[17rem] lg:min-w-[19rem] space-y-2">
             <button
                onClick={() => onSetView('creations')}
                className={getButtonClass('creations')}
                title="المنشآت"
            >
                <CreationsIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <span>المنشآت</span>
            </button>
             <button
                onClick={() => onSetView('settings')}
                className={getButtonClass('settings')}
                title="الإعدادات"
            >
                <SettingsIcon className="w-5 h-5 text-slate-500" />
                <span>الإعدادات</span>
            </button>
        </div>
      </aside>
    </>
  );
};

export default HistorySidebar;