
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatRole, MessagePart, Conversation, ChatMode } from '../types';
import { runQuery } from '../services/aiService';
import * as historyService from '../services/historyService';
import * as userService from '../services/userService';

export const useChat = () => {
  const [history, setHistory] = useState<Conversation[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('default');

  useEffect(() => {
    const loadedHistory = historyService.getHistory();
    setHistory(loadedHistory);
    if (loadedHistory.length > 0) {
      setCurrentChatId(loadedHistory[0].id);
    }
  }, []);

  const startNewChat = useCallback(() => {
    const userName = userService.getUserName();
    const welcomeMessage = userName
      ? `أهلاً بك يا ${userName}! أنا MZ. يركز هذا التطبيق الآن على الميزات الأساسية المدعومة لتقديم أفضل تجربة. كيف يمكنني مساعدتك اليوم؟`
      : 'أهلاً بك! أنا MZ. كيف يمكنني مساعدتك اليوم؟';

    const newChat: Conversation = {
      id: `chat-${Date.now()}`,
      title: 'محادثة جديدة',
      timestamp: Date.now(),
      messages: [
        {
          id: 'init',
          role: ChatRole.Model,
          parts: [{ type: 'text', text: welcomeMessage }],
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
          startNewChat();
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
    
    const currentChatIndex = history.findIndex(c => c.id === currentChatId);
    if (currentChatIndex === -1) {
        setIsLoading(false);
        return;
    }

    const updatedHistory = [...history];
    const currentChat = { ...updatedHistory[currentChatIndex] };
    currentChat.messages = [...currentChat.messages, newUserMessage];
    
    if (currentChat.messages.length === 2 && currentChat.messages[0].id === 'init') {
        currentChat.title = text.substring(0, 40) + (text.length > 40 ? '...' : '');
    }
    
    currentChat.timestamp = Date.now();
    updatedHistory.splice(currentChatIndex, 1);
    updatedHistory.unshift(currentChat);

    setHistory(updatedHistory);
    setCurrentChatId(currentChat.id);

    try {
        const response = await runQuery(currentChat.messages, chatMode);
        const modelMessage: ChatMessage = { 
            id: `model-${Date.now()}`, 
            role: ChatRole.Model, 
            parts: [{ type: 'text', text: response.text }], 
            debugInfo: response.debugInfo,
            groundingSources: response.sources
        };
        addMessageToCurrentChat(modelMessage);

    } catch (e) {
      const err = e instanceof Error ? e.message : 'An unknown error occurred.';
      const errorMessage: ChatMessage = { 
          id: `error-${Date.now()}`, 
          role: ChatRole.Error, 
          parts: [{ type: 'text', text: `عذراً، حدث خطأ: ${err}` }] 
      };
      addMessageToCurrentChat(errorMessage);
    } finally {
      setIsLoading(false);
       setHistory(prevHistory => {
        historyService.saveHistory(prevHistory);
        return prevHistory;
       });
    }
  }, [currentChatId, history, chatMode]);

  const currentChat = history.find(c => c.id === currentChatId);

  return { 
    history, 
    currentChat, 
    isLoading, 
    sendMessage, 
    startNewChat, 
    loadChat, 
    deleteChat,
    chatMode,
    setChatMode
  };
};