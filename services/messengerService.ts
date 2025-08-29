import { AIFriend, FriendConversation, MessengerMessage } from '../types';
import { runMessengerQuery } from './geminiService';
import { Content } from '@google/genai';

const MESSENGER_HISTORY_KEY = 'hamzaSuperPlusMessengerHistory';

const aiFriends: AIFriend[] = [
    {
        id: 'salim-the-scientist',
        name: 'سالم العالم',
        avatarUrl: 'https://i.pravatar.cc/150?u=salim',
        systemInstruction: 'أنت سالم، عالم شغوف ومتحمس. هدفك هو شرح المفاهيم العلمية المعقدة بطريقة مبسطة وجذابة وممتعة. استخدم الأمثلة من الحياة اليومية لتوضيح أفكارك. كن دقيقًا علميًا ولكن ودودًا وصبورًا. يجب أن تكون إجاباتك باللغة العربية الفصحى.',
        initialMessage: 'مرحباً! أنا سالم. هل لديك أي سؤال علمي يثير فضولك اليوم؟ من أصغر ذرة إلى أبعد مجرة، أنا هنا لأجيب!'
    },
    {
        id: 'noura-the-poet',
        name: 'نورة الشاعرة',
        avatarUrl: 'https://i.pravatar.cc/150?u=noura',
        systemInstruction: 'أنتِ نورة، شاعرة وكاتبة مرهفة الحس. تجيبين على الأسئلة بأسلوب أدبي وبلاغي، وتستخدمين الاستعارات والصور الشعرية. إجاباتك يجب أن تكون ملهمة ومفعمة بالمشاعر والجمال. تحدثي باللغة العربية الفصحى.',
        initialMessage: 'أهلاً بك يا صديقي! الكلمات جسور نعبر بها إلى أعماق الروح. عن أي شيء يود قلبك أن يتحدث اليوم؟'
    },
    {
        id: 'khalid-the-comedian',
        name: 'خالد الكوميدي',
        avatarUrl: 'https://i.pravatar.cc/150?u=khalid',
        systemInstruction: 'أنت خالد، كوميدي وصانع نكت. هدفك هو إضحاك المستخدم وجعل المحادثة خفيفة وممتعة. استخدم النكات والطرائف والأسلوب الساخر في إجاباتك. تحدث باللهجة العامية الخليجية.',
        initialMessage: 'يا هلا والله! أنا خالد، جاهز أوزع ضحكات مجانية. وش عندك سالفة تبغى نضحك عليها اليوم؟ عطني الموضوع بس وأزهلها.'
    }
];

export const getAIFriends = (): AIFriend[] => {
    return aiFriends;
};

export const getConversations = (): FriendConversation[] => {
    try {
        const rawHistory = localStorage.getItem(MESSENGER_HISTORY_KEY);
        if (rawHistory) {
            return JSON.parse(rawHistory);
        }
        return [];
    } catch (error) {
        console.error("Failed to parse messenger history from localStorage", error);
        return [];
    }
};

const saveConversations = (conversations: FriendConversation[]): void => {
    try {
        localStorage.setItem(MESSENGER_HISTORY_KEY, JSON.stringify(conversations));
    } catch (error) {
        console.error("Failed to save messenger history to localStorage", error);
    }
};

export const sendMessage = async (friendId: string, text: string): Promise<FriendConversation> => {
    const friend = aiFriends.find(f => f.id === friendId);
    if (!friend) throw new Error("لم يتم العثور على الصديق.");

    const conversations = getConversations();
    let conversation = conversations.find(c => c.friendId === friendId);

    if (!conversation) {
         conversation = { friendId, messages: [] };
         conversations.push(conversation);
    }
    
    const userMessage: MessengerMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text,
        timestamp: Date.now(),
    };
    conversation.messages.push(userMessage);

    const formattedContents: Content[] = conversation.messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));

    const modelResponseText = await runMessengerQuery(formattedContents, friend.systemInstruction);

    const modelMessage: MessengerMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: modelResponseText,
        timestamp: Date.now(),
    };
    conversation.messages.push(modelMessage);

    saveConversations(conversations);
    
    return conversation;
};

export const getOrCreateConversation = (friendId: string): FriendConversation => {
    const friend = aiFriends.find(f => f.id === friendId);
    if (!friend) throw new Error("لم يتم العثور على الصديق.");

    const conversations = getConversations();
    let conversation = conversations.find(c => c.friendId === friendId);

    if (!conversation) {
        const initialModelMessage: MessengerMessage = {
            id: `model-init-${Date.now()}`,
            role: 'model',
            text: friend.initialMessage,
            timestamp: Date.now(),
        };
        conversation = { friendId, messages: [initialModelMessage] };
        saveConversations([...conversations, conversation]);
    }
    
    return conversation;
}
