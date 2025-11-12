'use client';

import { paymentHistoryData as initialPayments } from './data';
import type { Payment } from './data';

export type { Payment };

const PAYMENTS_STORAGE_KEY = 'demyanenko_hub_payments';

// --- Helper Functions ---

const getPaymentsFromStorage = (): Payment[] => {
    if (typeof window === 'undefined') return [];
    try {
        const storedData = localStorage.getItem(PAYMENTS_STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
        // If no data, initialize with defaults from data.ts
        localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(initialPayments));
        return initialPayments;
    } catch (e) {
        console.error("Failed to read payments:", e);
        return [];
    }
};

const savePaymentsToStorage = (payments: Payment[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
    } catch (e) {
        console.error("Failed to save payments:", e);
    }
};

// --- Public API ---

/**
 * Fetches all payments.
 */
export const getPayments = (): Promise<Payment[]> => {
    return new Promise((resolve) => {
        const payments = getPaymentsFromStorage();
        resolve(payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
};

/**
 * Adds a new payment.
 */
export const addPayment = (paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    return new Promise((resolve) => {
        const payments = getPaymentsFromStorage();
        const newPayment: Payment = {
            ...paymentData,
            id: `payment_${Date.now()}`,
        };
        
        payments.push(newPayment);
        savePaymentsToStorage(payments);
        
        resolve(newPayment);
    });
};

/**
 * Updates an existing payment.
 */
export const updatePayment = (paymentId: string, updatedData: Partial<Omit<Payment, 'id'>>): Promise<Payment | null> => {
     return new Promise((resolve) => {
        let payments = getPaymentsFromStorage();
        const paymentIndex = payments.findIndex(p => p.id === paymentId);
        if (paymentIndex === -1) {
            resolve(null);
            return;
        }

        const updatedPayment = { ...payments[paymentIndex], ...updatedData };
        payments[paymentIndex] = updatedPayment;
        savePaymentsToStorage(payments);
        
        resolve(updatedPayment);
    });
}

/**
 * Deletes a payment.
 */
export const deletePayment = (paymentId: string): Promise<void> => {
    return new Promise((resolve) => {
       let payments = getPaymentsFromStorage();
       const updatedPayments = payments.filter(p => p.id !== paymentId);
       savePaymentsToStorage(updatedPayments);
       resolve();
    });
};
