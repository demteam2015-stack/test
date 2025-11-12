'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile } from '@/lib/data';

// --- Local Storage "Database" ---
const USERS_STORAGE_KEY = 'local_users_db';
const SESSION_STORAGE_KEY = 'local_user_session';

type StoredUser = Omit<UserProfile, 'id'> & { passwordHash: string; id: string; };

const getStoredUsers = (): StoredUser[] => {
  if (typeof window === 'undefined') return [];
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

const setStoredUsers = (users: StoredUser[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// A very simple hashing function for demonstration purposes.
// In a real app, use a robust library like bcrypt.
const simpleHash = async (password: string): Promise<string> => {
    // This is not secure. For demo only.
    return `hashed_${password}`;
}

// --- Auth Context ---

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (details: Omit<UserProfile, 'id' | 'role'> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedProfile: Partial<UserProfile>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a persisted session on initial load
    if (typeof window !== 'undefined') {
        const sessionJson = localStorage.getItem(SESSION_STORAGE_KEY);
        if (sessionJson) {
            setUser(JSON.parse(sessionJson));
        }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const users = getStoredUsers();
    const passwordHash = await simpleHash(password);
    const foundUser = users.find(u => u.email === email && u.passwordHash === passwordHash);

    if (foundUser) {
      const userProfile: UserProfile = {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role,
        photoURL: foundUser.photoURL
      };
      setUser(userProfile);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
    } else {
      throw new Error('Неверные учетные данные.');
    }
  };

  const signup = async (details: Omit<UserProfile, 'id' | 'role'> & { password: string }): Promise<void> => {
    const users = getStoredUsers();
    if (users.some(u => u.email === details.email)) {
      throw new Error('Пользователь с таким email уже существует.');
    }

    const passwordHash = await simpleHash(details.password);
    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      email: details.email,
      firstName: details.firstName,
      lastName: details.lastName,
      passwordHash,
      role: 'athlete', // Default role
      photoURL: `https://i.pravatar.cc/150?u=user_${Date.now()}`
    };

    setStoredUsers([...users, newUser]);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };
  
  const updateUser = (updatedProfile: Partial<UserProfile>) => {
    if(!user) return;

    const updatedUser = { ...user, ...updatedProfile };
    setUser(updatedUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));

    // Also update the "database"
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        // Keep the password hash from the original record
        const updatedDbUser = { ...users[userIndex], ...updatedProfile };
        users[userIndex] = updatedDbUser;
        setStoredUsers(users);
    }
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
