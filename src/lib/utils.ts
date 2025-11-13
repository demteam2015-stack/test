import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PlaceHolderImages } from "./placeholder-images"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// --- User display utility functions ---

export const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName[0]}${lastName[0]}`;
};

export const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'Атлет';
    return `${firstName} ${lastName}`.trim();
}

export const getAvatarUrl = (userId: string, username?: string) => {
      if (username === 'lexazver' || userId === 'initial_admin_id_placeholder') {
        const adminImage = PlaceHolderImages.find(img => img.id === 'user-lexazver');
        if (adminImage) return adminImage.imageUrl;
      }

      const userImage = PlaceHolderImages.find(img => img.id === `user-${userId.substring(0, 4)}`);
      if (userImage) return userImage.imageUrl;

      const athleteImages = PlaceHolderImages.filter(img => img.id.startsWith('athlete-'));
      if(athleteImages.length > 0) {
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return athleteImages[hash % athleteImages.length].imageUrl;
      }
      return `https://i.pravatar.cc/150?u=${userId}`;
  }
