import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PlaceHolderImages } from "./placeholder-images"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// --- User display utility functions ---

export const getInitials = (fullName?: string, fallback?: string) => {
    if (!fullName) return fallback?.substring(0, 2).toUpperCase() || 'U';
    
    // Special case for AI-Trainer
    if (fullName === "AI-Тренер") return "AI";

    const parts = fullName.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
};

export const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'Атлет';
    return `${firstName} ${lastName}`.trim();
}

export const getAvatarUrl = (userId: string, username?: string) => {
      if (username === 'lexazver' || userId === 'initial_admin_id_placeholder' || username === 'Тренер') {
        const adminImage = PlaceHolderImages.find(img => img.id === 'user-lexazver');
        if (adminImage) return adminImage.imageUrl;
      }

      if (username === 'AI-Тренер') {
         // Return a specific avatar for the AI
         return '/images/ai-avatar.png'; // Make sure this image exists in public/images
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
