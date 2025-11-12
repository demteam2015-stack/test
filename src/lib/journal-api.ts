'use client';

const JOURNAL_STORAGE_KEY = 'demyanenko_hub_journal_v2'; // new key to avoid conflicts

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface AttendanceRecord {
    eventId: string;
    athleteId: string;
    status: AttendanceStatus;
}

// Format: { [isoDateString]: { [eventId]: { [athleteId]: status } } }
export type JournalDay = {
    [eventId: string]: {
        [athleteId: string]: AttendanceStatus;
    };
};

export type Journal = {
    [isoDate: string]: JournalDay;
};


// --- Helper Functions ---

export const getJournal = (): Journal => {
    if (typeof window === 'undefined') return {};
    try {
        const storedData = localStorage.getItem(JOURNAL_STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : {};
    } catch (e) {
        console.error("Failed to read journal:", e);
        return {};
    }
};

const saveJournal = (journal: Journal) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(journal));
    } catch (e) {
        console.error("Failed to save journal:", e);
    }
};

// --- Public API ---

/**
 * Saves attendance data for a specific day and event.
 * The date should be in 'YYYY-MM-DD' format (from date.toISOString().split('T')[0])
 */
export const saveAttendance = (date: string, eventId: string, records: { athleteId: string, status: AttendanceStatus }[]): Promise<void> => {
    return new Promise((resolve) => {
        const journal = getJournal();
        if (!journal[date]) {
            journal[date] = {};
        }
        if (!journal[date][eventId]) {
            journal[date][eventId] = {};
        }

        records.forEach(record => {
            journal[date][eventId][record.athleteId] = record.status;
        });

        saveJournal(journal);
        resolve();
    });
};


/**
 * Fetches attendance data for a specific day.
 * The date should be in 'YYYY-MM-DD' format (from date.toISOString().split('T')[0])
 */
export const getAttendanceForDay = (date: string): Promise<JournalDay | undefined> => {
    return new Promise((resolve) => {
        const journal = getJournal();
        resolve(journal[date]);
    });
};
