
import React from 'react';
import { ChatMessage, ChatRole } from '../types';
import HexagonIcon from './icons/HexagonIcon';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isModel = message.role === ChatRole.Model;
  const isError = message.role === ChatRole.Error;

  const containerClasses = isModel || isError ? 'justify-start' : 'justify-end';
  const bubbleClasses = isModel
    ? 'bg-[var(--panel-dark)] border border-[var(--border-color)] text-slate-200'
    : isError
    ? 'bg-red-900/50 border border-red-500/50 text-red-200'
    : 'bg-cyan-600/80 border border-cyan-500/50 text-white';

  const renderTextWithLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts = text.split(linkRegex);
    
    return parts.map((part, index) => {
      if (index % 3 === 1) {
        const linkUrl = parts[index + 1];
        return (
          <a 
            key={index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--neon-cyan)] font-semibold underline hover:opacity-80"
          >
            {part}
          </a>
        );
      }
      if (index % 3 === 2) {
        return null;
      }
      return part;
    }).filter(Boolean);
  };

  return (
    <div className={`flex items-end gap-2 sm:gap-3 ${containerClasses}`}>
      {(isModel || isError) && <HexagonIcon className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 text-[var(--neon-cyan)]" />}
      
      <div className="flex flex-col">
        <div className={`max-w-xl lg:max-w-3xl p-3 sm:p-4 rounded-lg ${bubbleClasses}`}>
          {message.parts.map((part, index) => {
            if (part.type === 'text') {
              return (
                <div key={index} className="whitespace-pre-wrap prose prose-invert prose-p:text-slate-200 prose-p:my-2">
                  {renderTextWithLinks(part.text)}
                </div>
              );
            }
            if (part.type === 'image') {
              return (
                <img
                  key={index}
                  src={`data:${part.mimeType};base64,${part.data}`}
                  alt="صورة مرفوعة من المستخدم"
                  className="rounded-lg max-w-xs my-2"
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default Message;