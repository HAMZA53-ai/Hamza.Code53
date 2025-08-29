import React from 'react';
import { ChatMessage, ChatRole } from '../types';
import HamzaIcon from './icons/HamzaIcon';

interface MessageProps {
  message: ChatMessage;
  isDevMode: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isDevMode }) => {
  const isModel = message.role === ChatRole.Model;
  const isError = message.role === ChatRole.Error;

  const containerClasses = isModel || isError ? 'justify-start' : 'justify-end';
  const bubbleClasses = isModel
    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
    : isError
    ? 'bg-red-100 dark:bg-red-800/50 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200'
    : 'bg-teal-600 text-white';

  const renderTextWithLinks = (text: string) => {
    // Basic markdown link regex: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = text.split(linkRegex);
    
    return parts.map((part, index) => {
      if (index % 3 === 1) { // This is the link text
        const linkUrl = parts[index + 1];
        return (
          <a 
            key={index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 dark:text-teal-400 font-semibold underline hover:opacity-80"
          >
            {part}
          </a>
        );
      }
      if (index % 3 === 2) { // This is the URL part, ignore it
        return null;
      }
      return part; // This is a regular text part
    }).filter(Boolean);
  };

  return (
    <div className={`flex items-end gap-3 ${containerClasses}`}>
      {(isModel || isError) && <HamzaIcon className="w-8 h-8 flex-shrink-0 text-teal-500 dark:text-teal-400" />}
      
      <div className="flex flex-col">
        <div className={`max-w-xl lg:max-w-3xl p-4 rounded-2xl ${bubbleClasses}`}>
          {message.parts.map((part, index) => {
            if (part.type === 'text') {
              return (
                <div key={index} className="whitespace-pre-wrap">
                  {renderTextWithLinks(part.text)}
                </div>
              );
            }
            if (part.type === 'image') {
              return (
                <img
                  key={index}
                  src={`data:${part.mimeType};base64,${part.data}`}
                  alt="User upload"
                  className="rounded-lg max-w-xs my-2"
                />
              );
            }
            return null;
          })}
        </div>
        
        {isDevMode && isModel && message.debugInfo && (
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 px-2">
            <span>النموذج: {message.debugInfo.model}</span>
            <span className="mx-2">|</span>
            <span>الاستجابة: {message.debugInfo.responseTimeMs} مللي ثانية</span>
            {message.debugInfo.totalTokens !== undefined && (
              <>
                <span className="mx-2">|</span>
                <span>التوكنز: {message.debugInfo.totalTokens}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
