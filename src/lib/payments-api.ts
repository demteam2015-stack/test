'use client';

// This is a mock API. In a real application, this would be a call to a backend service.
// For now, we'll use localStorage to simulate a database.

const PAYMENTS_STORAGE_KEY = 'demyanenko_hub_payments_v2';

export interface Payment {
    id: string;
    invoice: string;
    date: string; // ISO string
    amount: string; // Keep as string to include currency, e.g., "1000.00 руб."
    status: "Оплачено" | "В ожидании" | "Не удалось";
}

const createInitialPayments = (): Payment[] => {
  return [
    { id: 'pay1', invoice: 'INV-001', date: new Date(new Date().setMonth(new Date().getMonth() -1)).toISOString(), amount: '1000.00', status: 'Оплачено'},
    { id: 'pay2', invoice: 'INV-002', date: new Date(new Date().setMonth(new Date().getMonth() -2)).toISOString(), amount: '1000.00', status: 'Оплачено'},
    { id: 'pay3', invoice: 'INV-003', date: new Date(new Date().setMonth(new Date().getMonth() -3)).toISOString(), amount: '500.00', status: 'Оплачено'},
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
        // If no data, initialize with defaults
        const initialPayments = createInitialPayments();
        savePaymentsToStorage(initialPayments);
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
