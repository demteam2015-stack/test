'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile as BaseUserProfile } from '@/lib/data';
import { addPayment, type Payment } from '@/lib/payments-api';

// --- Local Storage "Database" ---
const USERS_EMAIL_INDEX_PREFIX = 'user_email_';
const USERS_USERNAME_INDEX_PREFIX = 'user_username_';
const USERS_ID_INDEX_PREFIX = 'user_id_';
const SESSION_STORAGE_KEY = 'local_user_session_v2';
const ADMIN_PERMAROLE_KEY = 'admin_permarole_v3';
const INITIAL_ADMIN_CREATED = 'initial_admin_created_v3'; // Bumped version


export type UserProfile = BaseUserProfile & {
  balance?: number;
};


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
            iterations: 300000,
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
  username: string;
  salt: string; // hex
  iv: string; // hex
  encryptedProfile: string; // hex
};

// --- New Indexed Storage Functions ---
const getStoredUserByEmail = (email: string): StoredUser | null => {
    if (typeof window === 'undefined') return null;
    const key = `${USERS_EMAIL_INDEX_PREFIX}${email.toLowerCase()}`;
    const userJson = localStorage.getItem(key);
    return userJson ? JSON.parse(userJson) : null;
};

const getStoredUserByUsername = (username: string): StoredUser | null => {
    if (typeof window === 'undefined') return null;
    const key = `${USERS_USERNAME_INDEX_PREFIX}${username.toLowerCase()}`;
    const userJson = localStorage.getItem(key);
    return userJson ? JSON.parse(userJson) : null;
};

const getStoredUserById = (id: string): StoredUser | null => {
    if (typeof window === 'undefined') return null;
    const key = `${USERS_ID_INDEX_PREFIX}${id}`;
    const userJson = localStorage.getItem(key);
    return userJson ? JSON.parse(userJson) : null;
};

const setStoredUser = (user: StoredUser) => {
    if (typeof window === 'undefined') return;

    if (user.email) {
        const emailKey = `${USERS_EMAIL_INDEX_PREFIX}${user.email.toLowerCase()}`;
        localStorage.setItem(emailKey, JSON.stringify(user));
    }
    
    if (user.username) {
        const usernameKey = `${USERS_USERNAME_INDEX_PREFIX}${user.username.toLowerCase()}`;
        localStorage.setItem(usernameKey, JSON.stringify(user));
    }

    if (user.id) {
        const idKey = `${USERS_ID_INDEX_PREFIX}${user.id}`;
        localStorage.setItem(idKey, JSON.stringify(user));
    }
};

const deleteStoredUser = (user: StoredUser) => {
    if (typeof window === 'undefined') return;

    if (user.email) {
        const emailKey = `${USERS_EMAIL_INDEX_PREFIX}${user.email.toLowerCase()}`;
        localStorage.removeItem(emailKey);
    }
    
    if (user.username) {
        const usernameKey = `${USERS_USERNAME_INDEX_PREFIX}${user.username.toLowerCase()}`;
        localStorage.removeItem(usernameKey);
    }

    if (user.id) {
        const idKey = `${USERS_ID_INDEX_PREFIX}${user.id}`;
        localStorage.removeItem(idKey);
    }
}


// --- Auth Context ---

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (details: Omit<UserProfile, 'id' | 'role' | 'balance'> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedProfile: Partial<Omit<UserProfile, 'id' | 'username' | 'email'>>) => void;
  checkUserExists: (details: {email: string, username: string}) => boolean;
  adminResetPassword: (email: string, newPassword: string) => Promise<string>;
  getUserByEmail: (email: string) => Promise<UserProfile | null>;
  updateUserBalance: (userId: string, amount: number) => Promise<void>;
  deductFromBalance: (parentEmail: string, amount: number, description: string) => Promise<void>;
  adminGetUserProfile: (userId: string) => Promise<UserProfile | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to create/ensure the admin user exists with correct credentials
    const ensureAdminUser = async () => {
        if (typeof window === 'undefined' || localStorage.getItem(INITIAL_ADMIN_CREATED) === 'true') {
            return;
        }

        const adminEmail = 'lexazver@gmail.com';
        const adminUsername = 'lexazver';
        const adminPassword = '123123';
        
        let existingUser = getStoredUserByEmail(adminEmail);

        const salt = existingUser ? hexToBuffer(existingUser.salt) : generateSalt();
        const encryptionKey = await deriveKey(adminPassword, salt, ['encrypt']);

        const profileToEncrypt = {
            username: adminUsername,
            firstName: 'Алексей',
            lastName: 'Демьяненко',
            dateOfBirth: new Date('1990-01-01').toISOString(),
            role: 'admin',
            photoURL: '', // Will be set from placeholder images
            balance: 9999,
        };

        const { iv, encryptedData } = await encryptData(encryptionKey, profileToEncrypt);

        const adminUser: StoredUser = {
            id: existingUser?.id || 'initial_admin_id_placeholder',
            email: adminEmail,
            username: adminUsername,
            salt: bufferToHex(salt),
            iv: iv,
            encryptedProfile: encryptedData,
        };
        
        setStoredUser(adminUser);
        localStorage.setItem(INITIAL_ADMIN_CREATED, 'true');
        console.log('Admin user created or updated successfully.');
    };


  useEffect(() => {
    const setup = async () => {
        // Check for a persisted session on initial load
        if (typeof window !== 'undefined') {
            await ensureAdminUser();

            const sessionJson = sessionStorage.getItem(SESSION_STORAGE_KEY);
            const isAdminSession = localStorage.getItem(ADMIN_PERMAROLE_KEY) === 'true';

            if(isAdminSession) {
                setIsAdmin(true);
            }

            if (sessionJson) {
                try {
                    const sessionData = JSON.parse(sessionJson);
                    const foundUser = getStoredUserById(sessionData.id);
                    if (!foundUser) {
                        throw new Error("User from session not found in DB.");
                    }
                    
                    const decryptionKey = await deriveKey(sessionData.password, hexToBuffer(foundUser.salt), ['decrypt']);
                    const decryptedProfile = await decryptData(decryptionKey, hexToBuffer(foundUser.iv), hexToBuffer(foundUser.encryptedProfile)) as any;
                    
                    let userProfile: UserProfile = {
                        id: foundUser.id,
                        email: foundUser.email,
                        ...decryptedProfile
                    };
                    
                    if (isAdminSession && userProfile.id === 'initial_admin_id_placeholder') {
                       // This block is for ensuring the admin remains admin across sessions,
                    }

                    setUser(userProfile);
                } catch (e) {
                    console.error("Session restore failed:", e);
                    sessionStorage.removeItem(SESSION_STORAGE_KEY);
                    localStorage.removeItem(ADMIN_PERMAROLE_KEY);
                }
            }
        }
        setLoading(false);
    }
    setup();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Special check for admin login to ensure it always works with the default password
    if (email.toLowerCase() === 'lexazver@gmail.com') {
        await ensureAdminUser();
    }
      
    const foundUser = getStoredUserByEmail(email);

    if (foundUser) {
        try {
            const salt = hexToBuffer(foundUser.salt);
            const key = await deriveKey(password, salt, ['decrypt']);
            let profile = await decryptData(key, hexToBuffer(foundUser.iv), hexToBuffer(foundUser.encryptedProfile)) as Omit<UserProfile, 'id' | 'email'>;
            
            if (profile.role === 'admin') {
                setIsAdmin(true);
                localStorage.setItem(ADMIN_PERMAROLE_KEY, 'true');
            }
            
            const userProfile: UserProfile = {
                id: foundUser.id,
                email: foundUser.email,
                ...profile
            };

            setUser(userProfile);
            
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
                id: foundUser.id,
                password: password, 
            }));

        } catch(e) {
             throw new Error('Неверные учетные данные.');
        }
    } else {
      throw new Error('Неверные учетные данные.');
    }
  };

  const signup = async (details: Omit<UserProfile, 'id' | 'role' | 'balance'> & { password: string }): Promise<void> => {
    if (getStoredUserByEmail(details.email)) {
      throw new Error('Пользователь с таким email уже существует.');
    }
    if (getStoredUserByUsername(details.username)) {
      throw new Error('Пользователь с таким именем уже существует.');
    }
    
    const { password, ...profileData } = details;

    const salt = generateSalt();
    const encryptionKey = await deriveKey(password, salt, ['encrypt']);

    const profileToEncrypt = {
        username: profileData.username,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        dateOfBirth: profileData.dateOfBirth,
        role: 'athlete', // Default role
        photoURL: `https://i.pravatar.cc/150?u=${profileData.username}`,
        balance: 1000, // Starting balance for new users
    };

    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      email: details.email,
      username: details.username,
      salt: bufferToHex(salt),
      iv: '', // Will be set by encryption
      encryptedProfile: '', // Will be set by encryption
    };
    
    const { iv, encryptedData } = await encryptData(encryptionKey, profileToEncrypt);
    newUser.iv = iv;
    newUser.encryptedProfile = encryptedData;

    setStoredUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(ADMIN_PERMAROLE_KEY);
  };
  
  const updateUser = async (updatedProfile: Partial<Omit<UserProfile, 'id' | 'username' | 'email'>>) => {
    if(!user) return;
      
    const sessionJson = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionJson) {
        throw new Error("No active session, cannot update user.");
    }
    const { password } = JSON.parse(sessionJson);

    const dbUser = getStoredUserById(user.id);
    if (!dbUser) {
        throw new Error("User not found in database.");
    }
    
    const salt = hexToBuffer(dbUser.salt);

    const key = await deriveKey(password, salt, ['decrypt', 'encrypt']);
    const currentProfile = await decryptData(key, hexToBuffer(dbUser.iv), hexToBuffer(dbUser.encryptedProfile)) as any;

    let newProfileData = { ...currentProfile, ...updatedProfile };

    if (isAdmin && updatedProfile.role) {
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedProfile } : null);
    } else {
      setUser({ ...user, ...newProfileData });
    }

    const { iv, encryptedData } = await encryptData(key, newProfileData);

    const updatedUserObject: StoredUser = {
        ...dbUser,
        iv,
        encryptedProfile: encryptedData
    };
    
    setStoredUser(updatedUserObject);
  };
  
  const checkUserExists = (details: {email: string, username: string}): boolean => {
      const byEmail = getStoredUserByEmail(details.email);
      const byUsername = getStoredUserByUsername(details.username);
      return !!(byEmail && byUsername && byEmail.id === byUsername.id);
  }
    
  const adminGetUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const dbUser = getStoredUserById(userId);
    if (!dbUser) return null;

    if (!isAdmin) {
      console.error("Non-admin attempting to get full user profile.");
      return null;
    }
    const sessionJson = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionJson) return null;
    
    const adminKeyPassword = "admin_override";

    try {
        const key = await deriveKey(adminKeyPassword, hexToBuffer(dbUser.salt), ['decrypt']);
        const profile = await decryptData(key, hexToBuffer(dbUser.iv), hexToBuffer(dbUser.encryptedProfile)) as any;
        return {
            id: dbUser.id,
            email: dbUser.email,
            ...profile
        };
    } catch (e) {
        console.error("Admin could not decrypt user profile with override", e);
        return { id: dbUser.id, email: dbUser.email, username: dbUser.username, firstName: 'Encrypted', lastName: 'Data', role: 'athlete' };
    }
  };


  const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
      const dbUser = getStoredUserByEmail(email);
      if (!dbUser) return null;
      
      return {
          id: dbUser.id,
          email: dbUser.email,
          username: dbUser.username,
          firstName: 'Encrypted',
          lastName: 'Encrypted',
          role: 'parent',
      }
  }

  const updateUserBalance = async (userId: string, amount: number) => {
    if (!isAdmin) {
        throw new Error("Only admins can update balances.");
    }

    const dbUser = getStoredUserById(userId);
    if (!dbUser) throw new Error("User not found to update balance");

    const adminKeyPassword = "admin_override";
    const salt = hexToBuffer(dbUser.salt);
    
    try {
        const key = await deriveKey(adminKeyPassword, salt, ['decrypt', 'encrypt']);
        let profile: any;
        try {
            profile = await decryptData(key, hexToBuffer(dbUser.iv), hexToBuffer(dbUser.encryptedProfile));
        } catch {
            console.warn("Admin override failed to decrypt profile. This might happen if user has a different password. Re-initializing profile.");
            profile = {
                username: dbUser.username,
                firstName: 'Data',
                lastName: 'Reset',
                role: 'parent',
                balance: 0,
            };
        }

        profile.balance = (profile.balance || 0) + amount;

        const { iv, encryptedData } = await encryptData(key, profile);

        const updatedUserObject: StoredUser = {
            ...dbUser,
            iv,
            encryptedProfile: encryptedData
        };
        setStoredUser(updatedUserObject);
        
        if (user && user.id === userId) {
            setUser(prev => prev ? {...prev, balance: profile.balance} : null);
        }
    } catch (e) {
        console.error("CRITICAL: Failed to update balance with admin override.", e);
        throw new Error("Could not update user balance due to an internal error.");
    }
  }
  
  const deductFromBalance = async (parentEmail: string, amount: number, description: string) => {
    const parentUser = getStoredUserByEmail(parentEmail);
    if (!parentUser) {
        console.warn(`Deduction failed: Parent with email ${parentEmail} not found.`);
        return;
    }

    if (!isAdmin) {
        console.error("Deduction failed: Only admins can deduct from balance.");
        return;
    }
    
    const adminKeyPassword = "admin_override";
    const salt = hexToBuffer(parentUser.salt);
    
    try {
        const key = await deriveKey(adminKeyPassword, salt, ['decrypt', 'encrypt']);
        let profile: any;
        try {
            profile = await decryptData(key, hexToBuffer(parentUser.iv), hexToBuffer(parentUser.encryptedProfile));
        } catch(e) {
            console.error(`Failed to decrypt profile for ${parentEmail} to deduct balance.`, e);
            return;
        }

        const newBalance = (profile.balance || 0) - amount;
        profile.balance = newBalance;

        const { iv, encryptedData } = await encryptData(key, profile);
        const updatedUserObject: StoredUser = { ...parentUser, iv, encryptedProfile: encryptedData };
        setStoredUser(updatedUserObject);

        const paymentRecord: Omit<Payment, 'id'> = {
            invoice: `DEDUCT-${Date.now()}`,
            date: new Date().toISOString(),
            amount: `-${amount.toFixed(2)}`,
            userId: parentUser.id,
            userName: parentUser.username,
            status: 'Оплачено', 
        };
        await addPayment(paymentRecord);

        if (user && user.id === parentUser.id) {
            setUser(prev => prev ? {...prev, balance: newBalance} : null);
        }

    } catch (e) {
        console.error(`CRITICAL: Failed to deduct balance for ${parentEmail}.`, e);
    }
  }

  const adminResetPassword = async (email: string, newPassword: string): Promise<string> => {
    const oldUser = getStoredUserByEmail(email);
    if (!oldUser) {
        throw new Error("User to reset not found.");
    }
    
    deleteStoredUser(oldUser);

    const salt = generateSalt();
    const encryptionKey = await deriveKey(newPassword, salt, ['encrypt']);

    const profileToEncrypt = {
        username: oldUser.username,
        firstName: oldUser.username,
        lastName: '(сброшено)',
        role: 'athlete', 
        photoURL: `https://i.pravatar.cc/150?u=${oldUser.username}`,
        balance: 1000,
    };

    const newUser: StoredUser = {
      id: oldUser.id, 
      email: oldUser.email,
      username: oldUser.username,
      salt: bufferToHex(salt),
      iv: '', 
      encryptedProfile: '', 
    };
    
    const { iv, encryptedData } = await encryptData(encryptionKey, profileToEncrypt);
    newUser.iv = iv;
    newUser.encryptedProfile = encryptedData;
    
    setStoredUser(newUser);

    return `
Здравствуйте, ${newUser.username}!

Ваш пароль для доступа к "Центру команды Демьяненко" был сброшен администратором.

Ваши новые данные для входа:
Email: ${newUser.email}
Временный пароль: ${newPassword}

Пожалуйста, войдите в систему, используя этот временный пароль, и немедленно измените его в настройках своего профиля.
Обратите внимание: в связи со сбросом, ваши личные данные (имя, фамилия) были установлены по умолчанию. Пожалуйста, обновите их в профиле.

С уважением,
Администрация команды.
    `;
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, signup, logout, updateUser, checkUserExists, adminResetPassword, getUserByEmail, updateUserBalance, deductFromBalance, adminGetUserProfile }}>
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
