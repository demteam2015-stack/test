'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile } from '@/lib/data';

// --- Local Storage "Database" ---
const USERS_STORAGE_KEY = 'local_users_db_v2';
const SESSION_STORAGE_KEY = 'local_user_session_v2';


// --- Crypto Helpers ---

// Converts ArrayBuffer to a hex string
const bufferToHex = (buffer: ArrayBuffer): string => {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
};

// Converts a hex string back to ArrayBuffer
const hexToBuffer = (hexString: string): ArrayBuffer => {
  const bytes = new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  return bytes.buffer;
};

// Generates a random salt
const generateSalt = (): ArrayBuffer => {
    return window.crypto.getRandomValues(new Uint8Array(16)).buffer;
}

// Derives a key from a password and salt using PBKDF2
const deriveKey = async (password: string, salt: ArrayBuffer, usage: KeyUsage[]): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const baseKey = await window.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        true,
        usage
    );
}

// Encrypts data using AES-GCM
const encryptData = async (key: CryptoKey, data: object): Promise<{iv: string, encryptedData: string}> => {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        encoder.encode(JSON.stringify(data))
    );
    return {
        iv: bufferToHex(iv.buffer),
        encryptedData: bufferToHex(encryptedData)
    };
}

// Decrypts data using AES-GCM
const decryptData = async (key: CryptoKey, iv: ArrayBuffer, encryptedData: ArrayBuffer): Promise<object> => {
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        encryptedData
    );
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
};


// --- User Storage ---
type StoredUser = {
  id: string;
  email: string;
  salt: string; // hex
  iv: string; // hex
  encryptedProfile: string; // hex
};

// Function to initialize the database with an admin user if it's empty
const initializeUsers = async () => {
    if (typeof window === 'undefined') return;
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersJson || JSON.parse(usersJson).length === 0) {
        const salt = generateSalt();
        const encryptionKey = await deriveKey('password', salt, ['encrypt']);
        
        const adminProfile = {
            firstName: 'Lexa',
            lastName: 'Zver',
            role: 'admin',
            photoURL: `https://i.pravatar.cc/150?u=admin_lexazver`
        };

        const { iv, encryptedData } = await encryptData(encryptionKey, adminProfile);

        const adminUser: StoredUser = {
            id: 'admin_lexazver',
            email: 'lexazver@example.com',
            salt: bufferToHex(salt),
            iv: iv,
            encryptedProfile: encryptedData,
        };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([adminUser]));
    }
};

const getStoredUsers = (): StoredUser[] => {
  if (typeof window === 'undefined') return [];
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

const setStoredUsers = (users: StoredUser[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// --- Auth Context ---

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (details: Omit<UserProfile, 'id' | 'role'> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedProfile: Partial<Omit<UserProfile, 'id' | 'email'>>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setup = async () => {
        await initializeUsers();
        // Check for a persisted session on initial load
        if (typeof window !== 'undefined') {
            const sessionJson = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (sessionJson) {
                try {
                    const sessionData = JSON.parse(sessionJson);
                    const decryptionKey = await deriveKey(sessionData.password, hexToBuffer(sessionData.salt), ['decrypt']);
                    const decryptedProfile = await decryptData(decryptionKey, hexToBuffer(sessionData.iv), hexToBuffer(sessionData.encryptedProfile)) as any;
                    
                    setUser({
                        id: sessionData.id,
                        email: sessionData.email,
                        ...decryptedProfile
                    });

                } catch (e) {
                    console.error("Session restore failed:", e);
                    sessionStorage.removeItem(SESSION_STORAGE_KEY);
                }
            }
        }
        setLoading(false);
    }
    setup();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const users = getStoredUsers();
    const foundUser = users.find(u => u.email === email);

    if (foundUser) {
        try {
            const salt = hexToBuffer(foundUser.salt);
            const key = await deriveKey(password, salt, ['decrypt']);
            const profile = await decryptData(key, hexToBuffer(foundUser.iv), hexToBuffer(foundUser.encryptedProfile)) as Omit<UserProfile, 'id' | 'email'>;
            
            const userProfile: UserProfile = {
                id: foundUser.id,
                email: foundUser.email,
                ...profile
            };
            setUser(userProfile);
            
            // Store session data needed for re-hydration, including password for key derivation
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
                id: foundUser.id,
                email: foundUser.email,
                password: password, // Storing password in sessionStorage is a necessary trade-off for this architecture
                salt: foundUser.salt,
                iv: foundUser.iv,
                encryptedProfile: foundUser.encryptedProfile
            }));

        } catch(e) {
             throw new Error('Неверные учетные данные.');
        }
    } else {
      throw new Error('Неверные учетные данные.');
    }
  };

  const signup = async (details: Omit<UserProfile, 'id' | 'role'> & { password: string }): Promise<void> => {
    const users = getStoredUsers();
    if (users.some(u => u.email === details.email)) {
      throw new Error('Пользователь с таким email уже существует.');
    }
    
    const { password, ...profileData } = details;

    const salt = generateSalt();
    const encryptionKey = await deriveKey(password, salt, ['encrypt']);

    const profileToEncrypt = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        role: 'athlete', // Default role
        photoURL: `https://i.pravatar.cc/150?u=user_${Date.now()}`
    };

    const { iv, encryptedData } = await encryptData(encryptionKey, profileToEncrypt);

    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      email: details.email,
      salt: bufferToHex(salt),
      iv: iv,
      encryptedProfile: encryptedData
    };

    setStoredUsers([...users, newUser]);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };
  
  const updateUser = async (updatedProfile: Partial<Omit<UserProfile, 'id' | 'email'>>) => {
    if(!user) return;

    // Get password from session to re-derive key
    const sessionJson = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionJson) {
        throw new Error("No active session, cannot update user.");
    }
    const { password } = JSON.parse(sessionJson);

    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
        throw new Error("User not found in database.");
    }
    
    const dbUser = users[userIndex];
    const salt = hexToBuffer(dbUser.salt);

    // Decrypt existing profile
    const key = await deriveKey(password, salt, ['decrypt', 'encrypt']);
    const currentProfile = await decryptData(key, hexToBuffer(dbUser.iv), hexToBuffer(dbUser.encryptedProfile)) as any;

    // Merge changes and re-encrypt
    const newProfileData = { ...currentProfile, ...updatedProfile };
    const { iv, encryptedData } = await encryptData(key, newProfileData);

    // Update localStorage
    dbUser.iv = iv;
    dbUser.encryptedProfile = encryptedData;
    users[userIndex] = dbUser;
    setStoredUsers(users);

    // Update sessionStorage
    const newSessionData = { ...JSON.parse(sessionJson), iv, encryptedProfile: encryptedData };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSessionData));

    // Update React state
    setUser({ ...user, ...newProfileData });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
