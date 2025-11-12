'use client';

import { useAuth } from '@/context/auth-context';

const PAYMENTS_STORAGE_KEY = 'demyanenko_hub_payments_v2';

export interface Payment {
    id: string;
    invoice: string;
    date: string; // ISO string
    amount: string; // Keep as string to include currency, e.g., "1000.00 руб."
    status: "Оплачено" | "В ожидании" | "Не удалось";
    userId: string; // ID of the user who made the payment
    userName?: string; // To display in the admin table
}

const createInitialPayments = (userId: string, userName: string): Payment[] => {
  return [
    { id: 'pay1', invoice: 'INV-001', date: new Date(new Date().setMonth(new Date().getMonth() -1)).toISOString(), amount: '1000.00', status: 'Оплачено', userId, userName},
    { id: 'pay2', invoice: 'INV-002', date: new Date(new Date().setMonth(new Date().getMonth() -2)).toISOString(), amount: '1000.00', status: 'Оплачено', userId, userName},
    { id: 'pay3', invoice: 'INV-003', date: new Date(new Date().setMonth(new Date().getMonth() -3)).toISOString(), amount: '500.00', status: 'Оплачено', userId, userName},
  ];
};


// --- Helper Functions ---

const getPaymentsFromStorage = (): Payment[] => {
    if (typeof window === 'undefined') return [];
    try {
        const storedData = localStorage.getItem(PAYMENTS_STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
        // If no data, initialize with defaults for a sample user
        // This part is tricky without knowing the current user, so we might need a better seeding strategy.
        // For now, let's assume it's initialized on first use.
        return [];
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
export const getPayments = (currentUserId?: string): Promise<Payment[]> => {
    return new Promise((resolve) => {
        let payments = getPaymentsFromStorage();
        
        // If this is the first run and there are no payments, seed it.
        if (payments.length === 0 && currentUserId) {
            const initialPayments = createInitialPayments(currentUserId, 'Начальный пользователь');
            savePaymentsToStorage(initialPayments);
            payments = initialPayments;
        }
        
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
 * Updates an existing payment. If status changes to "Оплачено", it updates the user's balance.
 */
export const updatePayment = async (
    paymentId: string, 
    updatedData: Partial<Omit<Payment, 'id'>>,
    updateBalanceFn: (userId: string, amount: number) => Promise<void>
): Promise<Payment | null> => {
    let payments = getPaymentsFromStorage();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) {
        return null;
    }

    const originalPayment = payments[paymentIndex];
    const updatedPayment = { ...originalPayment, ...updatedData } as Payment;

    // --- Core Logic: Update balance on status change ---
    const wasPaid = originalPayment.status === 'Оплачено';
    const isNowPaid = updatedPayment.status === 'Оплачено';

    if (isNowPaid && !wasPaid) {
        const amount = parseFloat(updatedPayment.amount);
        if (!isNaN(amount) && amount > 0) {
            try {
                await updateBalanceFn(updatedPayment.userId, amount);
            } catch (error) {
                console.error("Failed to update balance on payment confirmation:", error);
                // Optionally, revert the status change or show an error to the admin
                // For now, we'll proceed but log the error.
            }
        }
    }
    // Note: This logic doesn't handle reversal (changing from Paid to something else).
    // A real system would need logic to reverse the transaction.

    payments[paymentIndex] = updatedPayment;
    savePaymentsToStorage(payments);
    
    return updatedPayment;
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
