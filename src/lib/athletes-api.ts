'use client';

import { teamMembersData as initialAthletes } from './data';

const ATHLETES_STORAGE_KEY = 'demyanenko_hub_athletes';

export interface Athlete {
    id: string;
    lastName: string;
    firstName: string;
    middleName?: string;
    dateOfBirth: string; // ISO string
    photoURL?: string;
}

// --- Helper Functions ---

const getAthletesFromStorage = (): Athlete[] => {
    if (typeof window === 'undefined') return [];
    try {
        const storedData = localStorage.getItem(ATHLETES_STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
        // If no data, initialize with defaults from data.ts
        localStorage.setItem(ATHLETES_STORAGE_KEY, JSON.stringify(initialAthletes));
        return initialAthletes;
    } catch (e) {
        console.error("Failed to read athletes:", e);
        return [];
    }
};

const saveAthletesToStorage = (athletes: Athlete[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(ATHLETES_STORAGE_KEY, JSON.stringify(athletes));
    } catch (e) {
        console.error("Failed to save athletes:", e);
    }
};

// --- Public API ---

/**
 * Fetches all athletes.
 */
export const getAthletes = (): Promise<Athlete[]> => {
    return new Promise((resolve) => {
        const athletes = getAthletesFromStorage();
        resolve(athletes.sort((a, b) => a.lastName.localeCompare(b.lastName)));
    });
};

/**
 * Adds a new athlete.
 */
export const addAthlete = (athleteData: Omit<Athlete, 'id'>): Promise<Athlete> => {
    return new Promise((resolve) => {
        const athletes = getAthletesFromStorage();
        const newAthlete: Athlete = {
            ...athleteData,
            id: `athlete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            photoURL: athleteData.photoURL || `https://i.pravatar.cc/150?u=${Date.now()}`
        };
        
        athletes.push(newAthlete);
        saveAthletesToStorage(athletes);
        
        resolve(newAthlete);
    });
};

/**
 * Updates an existing athlete.
 */
export const updateAthlete = (athleteId: string, updatedData: Partial<Omit<Athlete, 'id'>>): Promise<Athlete | null> => {
     return new Promise((resolve) => {
        let athletes = getAthletesFromStorage();
        const athleteIndex = athletes.findIndex(a => a.id === athleteId);
        if (athleteIndex === -1) {
            resolve(null);
            return;
        }

        const updatedAthlete = { ...athletes[athleteIndex], ...updatedData };
        athletes[athleteIndex] = updatedAthlete;
        saveAthletesToStorage(athletes);
        
        resolve(updatedAthlete);
    });
}

/**
 * Deletes an athlete.
 */
export const deleteAthlete = (athleteId: string): Promise<void> => {
    return new Promise((resolve) => {
       let athletes = getAthletesFromStorage();
       const updatedAthletes = athletes.filter(a => a.id !== athleteId);
       saveAthletesToStorage(updatedAthletes);
       resolve();
    });
};