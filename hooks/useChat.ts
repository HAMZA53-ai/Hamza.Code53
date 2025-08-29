import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatRole, MessagePart, Conversation } from '../types';
import { runQuery, generateImages, generateWebsite } from '../services/geminiService';
import * as historyService from '../services/historyService';

// Regex to detect commands
const imageCommandRegex = /^(?:انشئ|صمم|ارسم|ولّد)\s+صورة\s*لـ?:?\s*(.+)/i;
const websiteCommandRegex = /^(?:انشئ|صمم|ابنِ)\s+موقع\s*(?:ويب)?\s*عن:?\s*(.+)/i;


export const useChat = () => {
  const [history, setHistory] = useState<Conversation[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadedHistory = historyService.getHistory();
    setHistory(loadedHistory);
    if (loadedHistory.length > 0) {
      setCurrentChatId(loadedHistory[0].id);
    } else {
      startNewChat(true); 
    }
  }, []);

  const startNewChat = useCallback((isInitial = false) => {
    const newChat: Conversation = {
      id: `chat-${Date.now()}`,
      title: 'محادثة جديدة',
      timestamp: Date.now(),
      messages: [
        {
          id: 'init',
          role: ChatRole.Model,
          parts: [{ type: 'text', text: 'أهلاً بك! أنا حمزة سوبر بلس. يمكنك الدردشة معي أو أن تطلب مني إنشاء صورة أو موقع ويب. جرب أن تكتب "انشئ صورة لقطة في الفضاء".' }],
        },
      ],
    };

    setHistory(prevHistory => {
        const updatedHistory = [newChat, ...prevHistory];
        historyService.saveHistory(updatedHistory);
        return updatedHistory;
    });
    setCurrentChatId(newChat.id);
  }, []);

  const loadChat = useCallback((id: string) => {
    setCurrentChatId(id);
  }, []);

  const deleteChat = useCallback((id: string) => {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(chat => chat.id !== id);
      historyService.saveHistory(updatedHistory);
      
      if (currentChatId === id) {
        if (updatedHistory.length > 0) {
          setCurrentChatId(updatedHistory[0].id);
        } else {
          startNewChat(true);
        }
      }
      return updatedHistory;
    });
  }, [currentChatId, startNewChat]);
  
  const addMessageToCurrentChat = (message: ChatMessage) => {
      setHistory(prevHistory => {
        const historyCopy = [...prevHistory];
        const chatToUpdate = historyCopy.find(c => c.id === currentChatId);
        if (chatToUpdate) {
            chatToUpdate.messages = [...chatToUpdate.messages, message];
            historyService.saveHistory(historyCopy);
        }
        return historyCopy;
      });
  }

  const sendMessage = useCallback(async (text: string, image?: { data: string; mimeType: string }) => {
    if (!currentChatId) return;

    setIsLoading(true);

    const userMessageParts: MessagePart[] = [{ type: 'text', text }];
    if (image) {
      userMessageParts.push({ type: 'image', data: image.data, mimeType: image.mimeType });
    }

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: ChatRole.User,
      parts: userMessageParts,
    };
    
    // Update state with user message
    const currentChatIndex = history.findIndex(c => c.id === currentChatId);
    if (currentChatIndex === -1) {
        setIsLoading(false);
        return;
    }

    const updatedHistory = [...history];
    const currentChat = { ...updatedHistory[currentChatIndex] };
    currentChat.messages = [...currentChat.messages, newUserMessage];
    
    if (currentChat.messages.length === 2) {
        currentChat.title = text.substring(0, 40) + (text.length > 40 ? '...' : '');
    }
    
    currentChat.timestamp = Date.now();
    updatedHistory.splice(currentChatIndex, 1);
    updatedHistory.unshift(currentChat);

    setHistory(updatedHistory);
    setCurrentChatId(currentChat.id);

    // --- Command Detection ---
    const imageMatch = text.match(imageCommandRegex);
    const websiteMatch = text.match(websiteCommandRegex);

    try {
        if (imageMatch && !image) { // Don't trigger if user is asking about an uploaded image
            const prompt = imageMatch[1];
            const thinkingMessage: ChatMessage = { id: `model-thinking-${Date.now()}`, role: ChatRole.Model, parts: [{ type: 'text', text: `بالتأكيد! جارٍ إنشاء صورة لـ: ${prompt}...` }]};
            addMessageToCurrentChat(thinkingMessage);

            const images = await generateImages(prompt, 1, '1:1');
            const imagePart: MessagePart = { type: 'image', data: images[0].split(',')[1], mimeType: 'image/jpeg' };
            const modelMessage: ChatMessage = { id: `model-${Date.now()}`, role: ChatRole.Model, parts: [{type: 'text', text: 'تفضل، هذه هي الصورة التي طلبتها.'}, imagePart] };
            addMessageToCurrentChat(modelMessage);

        } else if (websiteMatch) {
            const prompt = websiteMatch[1];
            const thinkingMessage: ChatMessage = { id: `model-thinking-${Date.now()}`, role: ChatRole.Model, parts: [{ type: 'text', text: `فكرة رائعة! جارٍ تصميم موقع ويب عن: ${prompt}...` }]};
            addMessageToCurrentChat(thinkingMessage);
            
            const code = await generateWebsite(prompt, 'tailwind');
            const blob = new Blob([code], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const modelMessage: ChatMessage = { id: `model-${Date.now()}`, role: ChatRole.Model, parts: [{ type: 'text', text: `لقد انتهيت من بناء الموقع! يمكنك معاينته من خلال الرابط التالي:\n\n[افتح معاينة الموقع](${url})` }]};
            addMessageToCurrentChat(modelMessage);

        } else {
            // Default chat behavior
            const response = await runQuery(currentChat.messages);
            const modelMessage: ChatMessage = { id: `model-${Date.now()}`, role: ChatRole.Model, parts: [{ type: 'text', text: response.text }], debugInfo: response.debugInfo };
            addMessageToCurrentChat(modelMessage);
        }

    } catch (e) {
      const err = e instanceof Error ? e.message : 'An unknown error occurred.';
      const errorMessage: ChatMessage = { id: `error-${Date.now()}`, role: ChatRole.Error, parts: [{ type: 'text', text: `عذراً، حدث خطأ: ${err}` }] };
      addMessageToCurrentChat(errorMessage);
    } finally {
      setIsLoading(false);
       setHistory(prevHistory => {
        historyService.saveHistory(prevHistory);
        return prevHistory;
       });
    }
  }, [currentChatId, history]);

  const currentChat = history.find(c => c.id === currentChatId);

  return { history, currentChat, isLoading, sendMessage, startNewChat, loadChat, deleteChat };
};
