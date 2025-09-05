
import React, { useRef, useEffect } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';
import Spinner from './Spinner';
import { Conversation, ChatMode } from '../types';

interface ChatWindowProps {
  conversation: Conversation | undefined;
  isLoading: boolean;
  onSend: (text: string, image?: { data: string; mimeType: string }) => void;
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, isLoading, onSend, chatMode, setChatMode }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
            <Spinner />
            <p className="mt-4 text-slate-400">جارٍ تحميل المحادثات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6 cyber-scrollbar">
        {conversation.messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Spinner />
                  <span className="text-slate-400">يفكر...</span>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 sm:p-4 md:p-6 bg-transparent border-t border-[var(--border-color)]">
        <ChatInput 
          onSend={onSend} 
          disabled={isLoading} 
          chatMode={chatMode}
          setChatMode={setChatMode}
        />
      </div>
    </div>
  );
};

export default ChatWindow;