'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { CreditCard, LogOut, Settings, User as UserIcon, Shield, Repeat } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, type UserProfile } from '@/context/auth-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function UserNav() {
  const router = useRouter();
  const { user, logout, updateUser, isAdmin } = useAuth();

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName[0]}${lastName[0]}`;
  };

  const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'Атлет';
    return `${firstName} ${lastName}`;
  }
  
  if (!user) {
    return null;
  }

  const roleTranslations: { [key: string]: string } = {
    athlete: 'Спортсмен',
    coach: 'Тренер',
    parent: 'Родитель',
    admin: 'Администратор',
  };
  
  const allRoles: (UserProfile['role'])[] = ['admin', 'athlete', 'coach', 'parent'];

  const userRole = user.role ? roleTranslations[user.role] : 'Неизвестно';

  const handleRoleSwitch = (newRole: UserProfile['role']) => {
      // Only the permanent admin can switch roles
      if (isAdmin) {
          updateUser({ role: newRole });
          // Force a refresh to ensure all components re-evaluate the role
          // Note: a full reload might not be ideal in a complex app, but for this
          // simulation, it's the simplest way to ensure all contexts and components
          // get the new role. A more advanced solution might use a global state manager.
          setTimeout(() => window.location.reload(), 100);
      }
  }

  const getAvatarUrl = (userId: string) => {
      const userImage = PlaceHolderImages.find(img => img.id === `user-${userId.substring(0, 4)}`);
      if (userImage) return userImage.imageUrl;

      // Fallback to a random athlete image if no specific user image is found
      const athleteImages = PlaceHolderImages.filter(img => img.id.startsWith('athlete-'));
      if(athleteImages.length > 0) {
        // Simple hash function to pick a consistent image based on ID
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return athleteImages[hash % athleteImages.length].imageUrl;
      }
      return `https://i.pravatar.cc/150?u=${userId}`;
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
           <Avatar className="h-9 w-9">
              <AvatarImage
                src={user.photoURL ?? getAvatarUrl(user.id)}
                alt={getFullName(user.firstName, user.lastName)}
              />
              <AvatarFallback>
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getFullName(user.firstName, user.lastName)}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
             <DropdownMenuSeparator />
              <div className="flex items-center px-2 py-1.5 text-xs text-muted-foreground">
                <Shield className="mr-2 h-4 w-4" />
                <span>{userRole}</span>
              </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Профиль</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/payments')}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Оплата</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Настройки</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {isAdmin && (
                <>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Repeat className="mr-2 h-4 w-4" />
                        <span>Переключить роль</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {allRoles.map(role => (
                                <DropdownMenuItem 
                                    key={role}
                                    onClick={() => handleRoleSwitch(role)}
                                    disabled={user.role === role}
                                >
                                    <Shield className={`mr-2 h-4 w-4 ${user.role === role ? 'text-primary' : ''}`} />
                                    {roleTranslations[role]}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Выйти</span>
            </DropdownMenuItem>
          </>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
