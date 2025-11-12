// This is a simplified, client-side-only API for managing password reset requests.
// In a real application, this would be handled by a secure backend.

'use client';

import { toast } from "@/hooks/use-toast";

const REQUESTS_STORAGE_KEY = 'demyanenko_hub_reset_requests';

export interface ResetRequest {
    id: string;
    email: string;
    username: string;
    date: string; // ISO string
}

// --- Helper Functions ---

const getRequests = (): ResetRequest[] => {
    if (typeof window === 'undefined') return [];
    try {
        const storedData = localStorage.getItem(REQUESTS_STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (e) {
        console.error("Failed to read reset requests:", e);
        return [];
    }
};

const saveRequests = (requests: ResetRequest[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
        console.error("Failed to save reset requests:", e);
    }
};

// --- Public API ---

/**
 * Creates a new password reset request.
 * In a real app, this would also trigger an email to admins.
 */
export const createResetRequest = (email: string, username: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const requests = getRequests();
            
            // Prevent duplicate requests
            if (requests.some(r => r.email === email)) {
                toast({
                    title: "Запрос уже отправлен",
                    description: "Вы уже отправили запрос на сброс пароля для этого email.",
                });
                resolve(true); // Still resolve true to not show an error to the user
                return;
            }

            const newRequest: ResetRequest = {
                id: `reset_${Date.now()}`,
                email,
                username,
                date: new Date().toISOString(),
            };
            
            requests.push(newRequest);
            saveRequests(requests);
            
            toast({
                title: "Запрос на сброс отправлен",
                description: "Ваш запрос был отправлен администратору. Ожидайте инструкций по email.",
            });
            resolve(true);
        }, 1000);
    });
};

/**
 * Fetches all pending reset requests. For admin use.
 */
export const getPendingResetRequests = (): ResetRequest[] => {
    return getRequests();
};

/**
 * Deletes a reset request after it has been processed. For admin use.
 */
export const deleteResetRequest = (requestId: string): Promise<void> => {
    return new Promise((resolve) => {
       const requests = getRequests();
       const updatedRequests = requests.filter(r => r.id !== requestId);
       saveRequests(updatedRequests);
       resolve();
    });
};