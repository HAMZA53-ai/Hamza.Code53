
import React from 'react';
import { Conversation, MessagePart, View } from '../types';
import NewChatIcon from './icons/NewChatIcon';
import DeleteIcon from './icons/DeleteIcon';
import { formatTimestamp } from '../utils/dateFormatter';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import HistoryIcon from './icons/HistoryIcon';
import ToolsIcon from './icons/ToolsIcon';
import ArticleIcon from './icons/ArticleIcon';
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
    e.stopPropagation(); 
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
    const baseClass = "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 w-full text-right";
    const activeClass = currentView === view 
      ? 'bg-[var(--panel-interactive-hover)] text-[var(--neon-cyan)] shadow-[var(--glow-cyan)]' 
      : 'text-slate-300 hover:bg-[var(--panel-interactive-hover)] hover:text-white';
    
    return `${baseClass} ${activeClass}`;
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/80 z-20 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      ></div>

      <aside
        className={`flex flex-col h-full bg-[var(--panel-dark)] backdrop-blur-md border-l border-[var(--border-color)] flex-shrink-0 z-30 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 sm:w-72 lg:w-80' : 'w-0'}
        lg:static absolute right-0 top-0 overflow-hidden`}
      >
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col gap-2 flex-shrink-0 min-w-[15rem] sm:min-w-[17rem] lg:min-w-[19rem]">
            <button
              onClick={onNewChat}
              className={getButtonClass('chat')}
              title="محادثة جديدة"
            >
              <NewChatIcon className="w-5 h-5 text-[var(--neon-cyan)] [filter:drop-shadow(0_0_2px_var(--neon-cyan))]" />
              <span>محادثة جديدة</span>
            </button>
            <button
              onClick={() => onSetView('tools')}
              className={getButtonClass('tools')}
              title="الأدوات"
            >
              <ToolsIcon className="w-5 h-5 text-[var(--neon-cyan)] [filter:drop-shadow(0_0_2px_var(--neon-cyan))]" />
              <span>الأدوات</span>
            </button>
            <button
              onClick={() => onSetView('blog')}
              className={getButtonClass('blog')}
              title="مقالات / مدونة"
            >
              <ArticleIcon className="w-5 h-5 text-[var(--neon-cyan)] [filter:drop-shadow(0_0_2px_var(--neon-cyan))]" />
              <span>مقالات / مدونة</span>
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 min-w-[15rem] sm:min-w-[17rem] lg:min-w-[19rem] cyber-scrollbar">
            <h3 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">سجل المحادثات</h3>
            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
                    <HistoryIcon className="w-16 h-16 mb-4" />
                    <h3 className="font-semibold text-slate-400">لا يوجد سجل</h3>
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
                            ? 'bg-[var(--panel-interactive-hover)] text-white'
                            : 'hover:bg-[var(--panel-interactive-hover)] text-slate-300'
                        }`}
                        >
                        {isChatActive && (
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[var(--neon-cyan)] shadow-[var(--glow-active)] rounded-r-sm"></div>
                        )}

                        <ChatBubbleIcon className="w-5 h-5 flex-shrink-0 text-slate-400" />

                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm truncate">{chat.title}</p>
                            <span className={`text-xs flex-shrink-0 mr-2 ${
                                isChatActive ? 'text-slate-300' : 'text-slate-500'
                            }`}>
                                {formatTimestamp(chat.timestamp)}
                            </span>
                            </div>
                            <p className={`text-xs mt-1 truncate ${
                            isChatActive ? 'text-slate-300' : 'text-slate-400'
                            }`}>
                            {previewText}
                            </p>
                        </div>

                        <button
                            onClick={(e) => handleDelete(e, chat.id)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all rounded-full focus:opacity-100 bg-slate-700/50"
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
        <div className="p-2 border-t border-[var(--border-color)] min-w-[15rem] sm:min-w-[17rem] lg:min-w-[19rem] space-y-2">
             <button
                onClick={() => onSetView('creations')}
                className={getButtonClass('creations')}
                title="المنشآت"
            >
                <CreationsIcon className="w-5 h-5 text-[var(--neon-cyan)] [filter:drop-shadow(0_0_2px_var(--neon-cyan))]" />
                <span>المنشآت</span>
            </button>
             <button
                onClick={() => onSetView('settings')}
                className={getButtonClass('settings')}
                title="الإعدادات"
            >
                <SettingsIcon className="w-5 h-5 text-[var(--neon-cyan)] [filter:drop-shadow(0_0_2px_var(--neon-cyan))]" />
                <span>الإعدادات</span>
            </button>
        </div>
      </aside>
    </>
  );
};

export default HistorySidebar;
