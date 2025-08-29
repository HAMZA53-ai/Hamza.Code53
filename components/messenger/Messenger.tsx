import React, { useState, useEffect, useCallback } from 'react';
import FriendList from './FriendList';
import MessengerChatWindow from './MessengerChatWindow';
import * as messengerService from '../../services/messengerService';
import { AIFriend, FriendConversation } from '../../types';

const Messenger: React.FC = () => {
    const [friends] = useState<AIFriend[]>(messengerService.getAIFriends());
    const [conversations, setConversations] = useState<FriendConversation[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<AIFriend | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const allConversations = messengerService.getConversations();
        setConversations(allConversations);
        if (friends.length > 0) {
            setSelectedFriend(friends[0]);
        }
    }, [friends]);

    const handleSelectFriend = (friend: AIFriend) => {
        setSelectedFriend(friend);
    };

    const handleSendMessage = useCallback(async (text: string) => {
        if (!selectedFriend) return;

        setIsLoading(true);
        setError(null);
        try {
            const updatedConversation = await messengerService.sendMessage(selectedFriend.id, text);
            setConversations(prev => {
                const otherConversations = prev.filter(c => c.friendId !== selectedFriend.id);
                return [...otherConversations, updatedConversation];
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [selectedFriend]);

    const currentConversation = selectedFriend
        ? messengerService.getOrCreateConversation(selectedFriend.id)
        : null;

    return (
        <div className="flex h-full flex-row-reverse">
            <FriendList
                friends={friends}
                conversations={conversations}
                selectedFriendId={selectedFriend?.id || null}
                onSelectFriend={handleSelectFriend}
            />
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
                {selectedFriend && currentConversation ? (
                    <MessengerChatWindow
                        friend={selectedFriend}
                        conversation={currentConversation}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <p>اختر صديقًا لبدء المحادثة.</p>
                    </div>
                )}
                 {error && <div className="p-2 text-center text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20">{error}</div>}
            </div>
        </div>
    );
};

export default Messenger;
