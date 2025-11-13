'use client';

const MESSAGES_STORAGE_KEY = 'demyanenko_hub_messages_v2'; // Version bump for new structure

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: 'athlete' | 'coach' | 'parent' | 'admin';
    recipientId?: string; // ID of the recipient (e.g., coach's ID)
    threadId: string; // To group conversations
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

/**
 * Finds any user with the role of 'coach' or 'admin'.
 * This is a simplified approach for the local application.
 * It will return the first one it finds.
 */
export const getCoachUser = async (): Promise<{id: string, name: string} | null> => {
    if (typeof window === 'undefined') return null;

    // This is a heavy operation, but necessary for a fully client-side app
    // without a central user directory.
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_id_')) {
            try {
                const storedUser = JSON.parse(localStorage.getItem(key) || '{}');
                // The profile is encrypted, so we can't read the role directly.
                // For this app, we will rely on a naming convention for the admin/coach.
                if (storedUser.username?.includes('lexa') || storedUser.email?.includes('lexazver')) {
                    // We can't decrypt the name here, so we'll use a placeholder.
                    // This is a limitation of the current architecture.
                    return { id: storedUser.id, name: "Тренер" };
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }

    // A better approach would be to decrypt, but that requires the password.
    // A more realistic client-side approach might have a separate, unencrypted 'public_profiles' key
    // with basic info like name and role. For now, this fallback is okay.
    
    // Fallback if no specific coach is found, just find ANY admin or coach.
    // This is a placeholder and has security implications.
    return null;
}


// --- Public API ---

/**
 * Creates and saves a new message.
 * It will try to find an existing thread between the sender and recipient,
 * or create a new one if it doesn't exist.
 */
export const createMessage = (messageData: Omit<Message, 'id' | 'isRead' | 'threadId'> & {threadId?: string}): Promise<Message> => {
    return new Promise((resolve) => {
        const messages = getMessagesFromStorage();

        let threadId = messageData.threadId;

        // If no threadId is provided, try to find an existing one or create a new one.
        // This is key for ensuring a single dialogue between two users.
        if (!threadId) {
            const existingThread = messages.find(m => 
                (m.senderId === messageData.senderId && m.recipientId === messageData.recipientId) ||
                (m.senderId === messageData.recipientId && m.recipientId === messageData.senderId)
            );
            threadId = existingThread ? existingThread.threadId : `${messageData.senderId}_${messageData.recipientId}`;
        }
        
        const newMessage: Message = {
            ...messageData,
            threadId: threadId,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isRead: false,
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
 * Fetches all messages for a specific user, grouped by thread.
 */
export const getMessageThreadsForUser = (userId: string): Promise<Record<string, Message[]>> => {
    return new Promise((resolve) => {
        const messages = getMessagesFromStorage();
        const threads: Record<string, Message[]> = {};

        messages.forEach(msg => {
            // A user is part of a thread if they are the sender or recipient
            if (msg.senderId === userId || msg.recipientId === userId) {
                 if (!threads[msg.threadId]) {
                    threads[msg.threadId] = [];
                }
                threads[msg.threadId].push(msg);
            }
        });
        
        // Sort messages within each thread
        for (const threadId in threads) {
            threads[threadId].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        resolve(threads);
    });
};


/**
 * Marks messages in a thread as read by a specific user.
 */
export const markThreadAsRead = (threadId: string, readerId: string): Promise<void> => {
    return new Promise((resolve) => {
        let messages = getMessagesFromStorage();
        messages.forEach(msg => {
            // Mark as read if the message is in the thread and the reader is the recipient
            if (msg.threadId === threadId && msg.recipientId === readerId && !msg.isRead) {
                msg.isRead = true;
            }
        });
        saveMessagesToStorage(messages);
        resolve();
    });
};

/**
 * Counts unread messages for a specific user.
 */
export const getUnreadMessagesCountForUser = (userId: string): Promise<number> => {
    return new Promise((resolve) => {
        const messages = getMessagesFromStorage();
        const count = messages.filter(msg => msg.recipientId === userId && !msg.isRead).length;
        resolve(count);
    });
};
