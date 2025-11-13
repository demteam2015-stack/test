import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PlaceHolderImages } from "./placeholder-images"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// --- User display utility functions ---

export const getInitials = (fullNameOrFirstName?: string, lastName?: string) => {
    // Special case for AI-Trainer
    if (fullNameOrFirstName === "AI-Тренер") return "AI";
    
    const fullName = lastName ? `${fullNameOrFirstName} ${lastName}` : fullNameOrFirstName;

    if (!fullName) return 'U';
    
    const parts = fullName.split(' ').filter(Boolean);
    if (parts.length > 1 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    if (parts.length === 1 && parts[0]) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'U';
};

export const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'Атлет';
    return `${firstName || ''} ${lastName || ''}`.trim();
}

export const getAvatarUrl = (userId: string, username?: string) => {
      if (username === 'lexazver' || userId === 'initial_admin_id_placeholder' || username === 'Тренер') {
        const adminImage = PlaceHolderImages.find(img => img.id === 'user-lexazver');
        if (adminImage) return adminImage.imageUrl;
      }

      if (username === 'AI-Тренер' || userId === 'ai_coach_id') {
         // Return a specific avatar for the AI
         // This is a placeholder, you should have a real image here.
         return "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M12 8V4H8'%3e%3c/path%3e%3crect x='4' y='12' width='16' height='8' rx='2'%3e%3c/rect%3e%3cpath d='M12 12v8'%3e%3c/path%3e%3cpath d='M16 4v4'%3e%M16 8h4'%3e%3c/path%3e%3c/svg%3e";
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
