import React from 'react';
import { AIFriend, FriendConversation } from '../../types';

interface FriendListProps {
    friends: AIFriend[];
    conversations: FriendConversation[];
    selectedFriendId: string | null;
    onSelectFriend: (friend: AIFriend) => void;
}

const FriendList: React.FC<FriendListProps> = ({ friends, conversations, selectedFriendId, onSelectFriend }) => {
    const getLastMessage = (friendId: string) => {
        const conversation = conversations.find(c => c.friendId === friendId);
        if (conversation && conversation.messages.length > 0) {
            return conversation.messages[conversation.messages.length - 1].text;
        }
        const friend = friends.find(f => f.id === friendId);
        return friend?.initialMessage || '...';
    };

    return (
        <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">الأصدقاء</h2>
            </div>
            <ul className="overflow-y-auto flex-1">
                {friends.map(friend => {
                    const isSelected = friend.id === selectedFriendId;
                    const lastMessage = getLastMessage(friend.id);

                    return (
                        <li key={friend.id}>
                            <button
                                onClick={() => onSelectFriend(friend)}
                                className={`w-full text-right flex items-center gap-3 p-3 transition-colors ${
                                    isSelected
                                        ? 'bg-teal-100 dark:bg-teal-900/50'
                                        : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                <img
                                    src={friend.avatarUrl}
                                    alt={friend.name}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 overflow-hidden">
                                    <h3 className={`font-semibold ${isSelected ? 'text-teal-800 dark:text-teal-200' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {friend.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {lastMessage}
                                    </p>
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default FriendList;
