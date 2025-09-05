
import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import Header from './components/Header';
import { useChat } from './hooks/useChat';
import HistorySidebar from './components/HistorySidebar';
import Tools from './components/Tools';
import Blog from './components/Blog';
import Creations from './components/Creations';
import Settings from './components/Settings';
import { View } from './types';
import * as settingsService from './services/settingsService';
import WelcomeScreen from './components/WelcomeScreen';
import * as userService from './services/userService';
import ApiBanner from './components/ApiBanner';
import { getGeminiApiKey } from './services/apiKeyService';

const App: React.FC = () => {
  const {
    history,
    currentChat,
    isLoading,
    sendMessage,
    startNewChat,
    loadChat,
    deleteChat,
    chatMode,
    setChatMode,
  } = useChat();

  const [userName, setUserName] = useState<string | null>(() => userService.getUserName());
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<View>('chat');
  const [isApiConfigured, setIsApiConfigured] = useState(true);

  useEffect(() => {
    // Cyberpunk theme is always dark
    document.documentElement.classList.add('dark');
    // Check if the API key is configured on initial load.
    if (!process.env.API_KEY && !getGeminiApiKey()) {
      setIsApiConfigured(false);
    }
  }, []);
  
  const handleSetUserName = (name: string) => {
    userService.saveUserName(name);
    setUserName(name);
    // After user action on welcome screen, re-check for the key
    if (getGeminiApiKey()) {
        setIsApiConfigured(true);
    }
    if (history.length === 0) {
        startNewChat();
    }
  };

  const handleUpdateUserName = (newName: string) => {
    userService.saveUserName(newName);
    setUserName(newName);
  };
  
  const handleNewChat = () => {
    startNewChat();
    setCurrentView('chat');
  };

  const handleLoadChat = (id: string) => {
    loadChat(id);
    setCurrentView('chat');
  };

  const handleSetView = (view: View) => {
    setCurrentView(view);
    // On smaller screens, close sidebar when a view is selected
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return (
          <ChatWindow
            conversation={currentChat}
            isLoading={isLoading}
            onSend={sendMessage}
            chatMode={chatMode}
            setChatMode={setChatMode}
          />
        );
      case 'tools':
        return <Tools onNavigateToSettings={() => setCurrentView('settings')}/>;
      case 'blog':
        return <Blog />;
      case 'creations':
        return <Creations />;
      case 'settings':
        return <Settings 
                  currentUserName={userName!}
                  onUpdateUserName={handleUpdateUserName}
                />;
      default:
        return null;
    }
  }
  
  if (!userName) {
    return <WelcomeScreen onSetName={handleSetUserName} />;
  }

  return (
    <div className="flex flex-col h-screen bg-transparent text-slate-200 font-sans overflow-hidden">
      {!isApiConfigured && <ApiBanner />}
      <div className="flex flex-row-reverse flex-1 min-h-0">
        <HistorySidebar
          history={history}
          currentChatId={currentChat?.id || null}
          onNewChat={handleNewChat}
          onLoadChat={handleLoadChat}
          onDeleteChat={deleteChat}
          isOpen={isSidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
          onSetView={handleSetView}
          currentView={currentView}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-hidden relative">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
