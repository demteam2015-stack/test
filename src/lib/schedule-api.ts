'use client';

import { startOfDay } from 'date-fns';

const EVENTS_STORAGE_KEY = 'demyanenko_hub_events';

export interface TrainingEvent {
    id: string;
    title: string;
    date: string; // ISO string
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    location: string;
    notes?: string;
    createdBy: string; // username
    type: 'training' | 'competition' | 'meeting' | 'holiday';
}

// --- Helper Functions ---

const getEvents = (): TrainingEvent[] => {
    if (typeof window === 'undefined') return [];
    try {
        const storedData = localStorage.getItem(EVENTS_STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (e) {
        console.error("Failed to read events:", e);
        return [];
    }
};

const saveEvents = (events: TrainingEvent[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
        console.error("Failed to save events:", e);
    }
};

// --- Public API ---

/**
 * Creates a new training event.
 */
export const createEvent = (eventData: Omit<TrainingEvent, 'id'>): Promise<TrainingEvent> => {
    return new Promise((resolve) => {
        const events = getEvents();
        const newEvent: TrainingEvent = {
            ...eventData,
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        
        events.push(newEvent);
        saveEvents(events);
        
        resolve(newEvent);
    });
};

/**
 * Fetches all events.
 */
export const getAllEvents = (): TrainingEvent[] => {
    return getEvents().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Fetches events for a specific day.
 */
export const getEventsForDay = (date: Date): TrainingEvent[] => {
    const dayStart = startOfDay(date);
    return getEvents()
        .filter(event => startOfDay(new Date(event.date)).getTime() === dayStart.getTime())
        .sort((a,b) => a.startTime.localeCompare(b.startTime));
}

/**
 * Updates an existing event.
 */
export const updateEvent = (eventId: string, updatedData: Partial<Omit<TrainingEvent, 'id'>>): Promise<TrainingEvent | null> => {
     return new Promise((resolve) => {
        let events = getEvents();
        const eventIndex = events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            resolve(null);
            return;
        }

        const updatedEvent = { ...events[eventIndex], ...updatedData } as TrainingEvent;
        events[eventIndex] = updatedEvent;
        saveEvents(events);
        
        resolve(updatedEvent);
    });
}

/**
 * Deletes an event.
 */
export const deleteEvent = (eventId: string): Promise<void> => {
    return new Promise((resolve) => {
       let requests = getEvents();
       const updatedRequests = requests.filter(r => r.id !== eventId);
       saveEvents(updatedRequests);
       resolve();
    });
};

/**
 * Deletes all events from storage.
 */
export const clearAllEvents = (): Promise<void> => {
    return new Promise((resolve) => {
       saveEvents([]);
       resolve();
    });
};
