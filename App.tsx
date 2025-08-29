import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import Header from './components/Header';
import { useChat } from './hooks/useChat';
import HistorySidebar from './components/HistorySidebar';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import WebsiteGenerator from './components/WebsiteGenerator';
import BookGenerator from './components/BookGenerator';
// FIX: Import the new Messenger component.
import Messenger from './components/messenger/Messenger';
import Creations from './components/Creations';
import Settings from './components/Settings';
import { View } from './types';
import * as settingsService from './services/settingsService';

const App: React.FC = () => {
  const {
    history,
    currentChat,
    isLoading,
    sendMessage,
    startNewChat,
    loadChat,
    deleteChat,
  } = useChat();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<View>('chat');
  const [theme, setTheme] = useState<'light' | 'dark'>(settingsService.getTheme());
  const [isDevMode, setDevMode] = useState<boolean>(settingsService.getDeveloperMode());


  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    settingsService.setTheme(theme);
  }, [theme]);

  const handleSetDevMode = (enabled: boolean) => {
    setDevMode(enabled);
    settingsService.setDeveloperMode(enabled);
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
            isDevMode={isDevMode}
          />
        );
      case 'image':
        return <ImageGenerator />;
      case 'video':
        return <VideoGenerator />;
      case 'website':
        return <WebsiteGenerator />;
      case 'book':
        return <BookGenerator />;
      // FIX: Add a case to render the Messenger component.
      case 'messenger':
        return <Messenger />;
      case 'creations':
        return <Creations />;
      case 'settings':
        return <Settings 
                  currentTheme={theme} 
                  onSetTheme={setTheme} 
                  isDevMode={isDevMode}
                  onSetDevMode={handleSetDevMode}
                />;
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-row-reverse h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-sans overflow-hidden transition-colors duration-300">
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
  );
};

export default App;