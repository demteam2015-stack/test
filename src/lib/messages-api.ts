'use client';

const MESSAGES_STORAGE_KEY = 'demyanenko_hub_messages_v1';

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderEmail: string;
    senderRole: 'athlete' | 'coach' | 'parent' | 'admin';
    text: string;
    date: string; // ISO string
    isRead: boolean;
}

export interface MessageWithReadStatus extends Message {
    isRead: boolean;
}

// --- Helper Functions ---

const getMessagesFromStorage = (): Message[] => {
    if (typeof window === 'undefined') return [];
    try {
        const storedData = localStorage.getItem(MESSAGES_STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (e) {
        console.error("Failed to read messages:", e);
        return [];
    }
};

const saveMessagesToStorage = (messages: Message[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
        console.error("Failed to save messages:", e);
    }
};

// --- Public API ---

/**
 * Creates and saves a new message.
 */
export const createMessage = (messageData: Omit<Message, 'id'>): Promise<Message> => {
    return new Promise((resolve) => {
        const messages = getMessagesFromStorage();
        const newMessage: Message = {
            ...messageData,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        
        messages.push(newMessage);
        saveMessagesToStorage(messages);
        
        resolve(newMessage);
    });
};

/**
 * Fetches all messages, sorted with the newest first.
 */
export const getMessages = (): Promise<Message[]> => {
    return new Promise((resolve) => {
        const messages = getMessagesFromStorage();
        resolve(messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
};


/**
 * Fetches all messages for a specific user.
 */
export const getMessagesForUser = (userId: string): Promise<MessageWithReadStatus[]> => {
    return new Promise((resolve) => {
        const messages = getMessagesFromStorage();
        const userMessages = messages
            .filter(msg => msg.senderId === userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(userMessages);
    });
};


/**
 * Marks all messages as read.
 */
export const markAllMessagesAsRead = (): Promise<void> => {
    return new Promise((resolve) => {
        let messages = getMessagesFromStorage();
        messages = messages.map(msg => ({ ...msg, isRead: true }));
        saveMessagesToStorage(messages);
        resolve();
    });
};

/**
 * Counts unread messages.
 */
export const getUnreadMessagesCount = (): Promise<number> => {
    return new Promise((resolve) => {
        const messages = getMessagesFromStorage();
        const count = messages.filter(msg => !msg.isRead).length;
        resolve(count);
    });
};
