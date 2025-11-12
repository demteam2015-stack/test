'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile as BaseUserProfile } from '@/lib/data';

// --- Local Storage "Database" ---
const USERS_EMAIL_INDEX_PREFIX = 'user_email_';
const USERS_USERNAME_INDEX_PREFIX = 'user_username_';
const USERS_ID_INDEX_PREFIX = 'user_id_';
const SESSION_STORAGE_KEY = 'local_user_session_v2';
const MIGRATION_KEY = 'local_db_migrated_to_indexed_v1';
const ADMIN_PERMAROLE_KEY = 'admin_permarole_v3'; // Incremented version


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
        const idKey = `${USERS_ID_INDEX_PREFIX}${id}`;
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
        const idKey = `${USERS_ID_INDEX_PREFIX}${id}`;
        localStorage.removeItem(idKey);
    }
}


// Function to migrate from old array-based storage to new indexed storage
const runMigration = async () => {
    if (typeof window === 'undefined') return;
    const hasMigrated = localStorage.getItem(MIGRATION_KEY);
    if (hasMigrated) return; // Don't run migration twice

    const oldUsersKey = 'local_users_db_v2';
    const usersJson = localStorage.getItem(oldUsersKey);

    if (usersJson) {
        try {
            const users: StoredUser[] = JSON.parse(usersJson);
            if (Array.isArray(users)) {
                users.forEach(user => {
                    // Add checks for properties before calling toLowerCase
                    if (user && user.email && user.username) {
                       setStoredUser(user)
                    }
                });
                // Once migration is successful, we can remove the old key
                localStorage.removeItem(oldUsersKey);
            }
        } catch (e) {
            console.error("Failed to parse or migrate old user data:", e);
        }
    }
    
    // Always mark as migrated to avoid re-running, even on failure.
    localStorage.setItem(MIGRATION_KEY, 'true');
};


// Function to initialize the database with an admin user if it's empty
const initializeAdminUser = async () => {
    if (typeof window === 'undefined') return;
    
    // Check if admin already exists to avoid re-creation
    if (getStoredUserByEmail('lexazver@example.com')) return;

    const salt = generateSalt();
    const encryptionKey = await deriveKey('password', salt, ['encrypt']);
    
    const adminProfile = {
        username: 'lexazver',
        firstName: 'Lexa',
        lastName: 'Zver',
        role: 'admin',
        photoURL: `https://i.pravatar.cc/150?u=admin_lexazver`,
        balance: 999999,
    };

    const { iv, encryptedData } = await encryptData(encryptionKey, adminProfile);

    const adminUser: StoredUser = {
        id: 'admin_lexazver',
        email: 'lexazver@example.com',
        username: 'lexazver',
        salt: bufferToHex(salt),
        iv: iv,
        encryptedProfile: encryptedData,
    };
    
    setStoredUser(adminUser);
};


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
  adminGetUserProfile: (userId: string) => Promise<UserProfile | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const setup = async () => {
        await runMigration();
        await initializeAdminUser();
        
        // Check for a persisted session on initial load
        if (typeof window !== 'undefined') {
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

                    // On initial load, if it's the admin, ensure the role is 'admin' for the state
                    if (userProfile.id === 'admin_lexazver') {
                        setIsAdmin(true);
                        // If the decrypted role is not admin (from a previous temporary switch),
                        // but we know this is the admin user, let's respect the stateful role if it exists,
                        // otherwise default to admin.
                        if (user?.role) {
                            userProfile.role = user.role;
                        } else {
                            userProfile.role = 'admin';
                        }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const foundUser = getStoredUserByEmail(email);

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
            
            // Force admin role if it's the admin user
            if (userProfile.id === 'admin_lexazver') {
                userProfile.role = 'admin';
                setIsAdmin(true);
                localStorage.setItem(ADMIN_PERMAROLE_KEY, 'true');
            }

            setUser(userProfile);
            
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
                id: foundUser.id,
                password: password, // Storing password in sessionStorage is a security risk, but necessary for this local-only setup to re-derive key for updates.
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

    const { iv, encryptedData } = await encryptData(encryptionKey, profileToEncrypt);

    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      email: details.email,
      username: details.username,
      salt: bufferToHex(salt),
      iv: iv,
      encryptedProfile: encryptedData
    };

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

    // For the permanent admin, we NEVER persist a role change to the encrypted data.
    // The role is only changed in the React state.
    if (isAdmin && dbUser.id === 'admin_lexazver' && updatedProfile.role) {
        newProfileData.role = 'admin'; // Always keep 'admin' in the encrypted blob
        setUser(prevUser => prevUser ? {...prevUser, ...updatedProfile} : null);
    }
    
    const { iv, encryptedData } = await encryptData(key, newProfileData);

    const updatedUserObject: StoredUser = {
        ...dbUser,
        iv,
        encryptedProfile: encryptedData
    };
    
    setStoredUser(updatedUserObject);

    // If it's not the admin role switch case, update the state normally.
    if (!(isAdmin && dbUser.id === 'admin_lexazver' && updatedProfile.role)) {
        setUser({ ...user, ...newProfileData });
    }
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
    
    // For this simulation, the admin will use a special "override" password
    // to decrypt and re-encrypt any user's data. This is NOT secure.
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
        // Return basic info if all decryption fails
        return { id: dbUser.id, email: dbUser.email, username: dbUser.username, firstName: 'Encrypted', lastName: 'Data', role: 'athlete' };
    }
  };


  const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
      const dbUser = getStoredUserByEmail(email);
      if (!dbUser) return null;
      
      // Public-facing, so we don't return encrypted data.
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

    // For this simulation, the admin will use a special "override" password
    // to decrypt and re-encrypt any user's data. This is NOT secure.
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
        
        // If the updated user is the currently logged-in user, update their state
        if (user && user.id === userId) {
            setUser(prev => prev ? {...prev, balance: profile.balance} : null);
        }
    } catch (e) {
        console.error("CRITICAL: Failed to update balance with admin override.", e);
        throw new Error("Could not update user balance due to an internal error.");
    }
  }

  const adminResetPassword = async (email: string, newPassword: string): Promise<string> => {
    const oldUser = getStoredUserByEmail(email);
    if (!oldUser) {
        throw new Error("User to reset not found.");
    }
    
    // Delete the old user account
    deleteStoredUser(oldUser);

    // Create a new account with the same details but new password
    const salt = generateSalt();
    const encryptionKey = await deriveKey(newPassword, salt, ['encrypt']);

    // We can't know the old first/last name, so we use placeholders.
    // The user will have to update their profile.
    const profileToEncrypt = {
        username: oldUser.username,
        firstName: oldUser.username,
        lastName: '(сброшено)',
        role: 'athlete', // Assume default role after reset
        photoURL: `https://i.pravatar.cc/150?u=${oldUser.username}`,
        balance: 1000,
    };

    const { iv, encryptedData } = await encryptData(encryptionKey, profileToEncrypt);

    const newUser: StoredUser = {
      id: oldUser.id, // Keep the same ID
      email: oldUser.email,
      username: oldUser.username,
      salt: bufferToHex(salt),
      iv: iv,
      encryptedProfile: encryptedData
    };
    
    setStoredUser(newUser);

    // Return a pre-formatted email text for the admin to send
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
    <AuthContext.Provider value={{ user, loading, isAdmin, login, signup, logout, updateUser, checkUserExists, adminResetPassword, getUserByEmail, updateUserBalance, adminGetUserProfile }}>
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
