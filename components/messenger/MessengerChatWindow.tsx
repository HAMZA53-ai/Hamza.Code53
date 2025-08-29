import React, { useRef, useEffect } from 'react';
import { AIFriend, FriendConversation } from '../../types';
import MessengerMessage from './MessengerMessage';
import ChatInput from '../ChatInput';
import Spinner from '../Spinner';

interface MessengerChatWindowProps {
    friend: AIFriend;
    conversation: FriendConversation;
    onSendMessage: (text: string) => void;
    isLoading: boolean;
}

const MessengerChatWindow: React.FC<MessengerChatWindowProps> = ({ friend, conversation, onSendMessage, isLoading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation.messages]);

    const handleSend = (text: string) => {
        onSendMessage(text);
    };

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{friend.name}</h3>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {conversation.messages.map(msg => (
                    <MessengerMessage key={msg.id} message={msg} friendAvatarUrl={friend.avatarUrl} />
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <Spinner />
                            <span className="text-slate-500 dark:text-slate-400">يكتب...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
                 {/* Reusing ChatInput but ignoring its image capabilities for now */}
                <ChatInput onSend={handleSend} disabled={isLoading} />
            </div>
        </div>
    );
};

export default MessengerChatWindow;
