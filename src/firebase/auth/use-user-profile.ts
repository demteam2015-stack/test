'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, type UseDocResult } from '@/firebase/firestore/use-doc';
import { useUser } from '@/firebase/provider';
import { useFirestore } from '@/firebase/provider';

// Define the shape of the user profile data stored in Firestore.
// This should align with the structure in `docs/backend.json`.
export interface UserProfile {
  id: string;
  email: string;
  role: 'athlete' | 'coach' | 'parent' | 'admin';
  firstName: string;
  lastName: string;
}

/**
 * A hook to fetch and subscribe to the current user's profile from Firestore.
 *
 * This hook combines the `useUser` hook (for auth state) and the `useDoc`
 * hook (for Firestore data) to provide a unified view of the logged-in user's
 * profile information.
 *
 * @returns {UseDocResult<UserProfile>} An object containing the user profile `data`,
 * `isLoading` state, and any `error` that occurred during fetching.
 *
 * @example
 * const { data: userProfile, isLoading, error } = useUserProfile();
 *
 * if (isLoading) {
 *   return <p>Loading profile...</p>;
 * }
 *
 * if (error) {
 *   return <p>Error loading profile: {error.message}</p>;
 * }
 *
 * if (userProfile) {
 *   return (
 *     <div>
 *       <h1>Welcome, {userProfile.firstName}!</h1>
 *       <p>Your role is: {userProfile.role}</p>
 *     </div>
 *   );
 * }
 *
 * return <p>Please log in.</p>;
 */
export function useUserProfile(): UseDocResult<UserProfile> {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  // Create a memoized document reference to the user's profile.
  // This prevents re-creating the reference on every render, which is crucial for `useDoc`.
  const userDocRef = useMemo(() => {
    if (!user?.uid || !firestore) {
      return null;
    }
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const {
    data: profileData,
    isLoading: isProfileLoading,
    error,
  } = useDoc<UserProfile>(userDocRef);

  // The overall loading state is true if either auth state or profile fetch is in progress.
  const isLoading = isAuthLoading || (!!user && isProfileLoading);

  return { data: profileData, isLoading, error };
}
