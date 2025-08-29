import React from 'react';
import { MessengerMessage as MessageType } from '../../types';

interface MessengerMessageProps {
    message: MessageType;
    friendAvatarUrl: string;
}

const MessengerMessage: React.FC<MessengerMessageProps> = ({ message, friendAvatarUrl }) => {
    const isModel = message.role === 'model';
    const containerClasses = isModel ? 'justify-start' : 'justify-end';
    const bubbleClasses = isModel
        ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-lg'
        : 'bg-teal-600 text-white rounded-br-lg';

    return (
        <div className={`flex items-end gap-3 ${containerClasses}`}>
            {isModel && (
                <img
                    src={friendAvatarUrl}
                    alt="Friend Avatar"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
            )}
            <div className={`max-w-xl lg:max-w-2xl p-3 rounded-2xl ${bubbleClasses}`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
        </div>
    );
};

export default MessengerMessage;
