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
} from '@/components/ui/dropdown-menu';
import { useAuth, useUserProfile } from '@/firebase';
import { CreditCard, LogOut, Settings, User as UserIcon, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

export function UserNav() {
  const { user } = useUserProfile();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    auth.signOut();
    router.push('/login');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName[0]}${lastName[0]}`;
  };

  const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'Атлет';
    return `${firstName} ${lastName}`;
  }

  const roleTranslations: { [key: string]: string } = {
    athlete: 'Спортсмен',
    coach: 'Тренер',
    parent: 'Родитель',
    admin: 'Администратор',
  };

  const userRole = user?.role ? roleTranslations[user.role] : 'Загрузка...';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
           <Avatar className="h-9 w-9">
            {user ? (
              <>
                <AvatarImage
                  src={user?.photoURL ?? `https://i.pravatar.cc/150?u=${user?.id}`}
                  alt={getFullName(user?.firstName, user?.lastName)}
                />
                <AvatarFallback>
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </>
            ) : (
              <Skeleton className="h-9 w-9 rounded-full" />
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {user ? (
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
                <UserIcon />
                Профиль
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/payments')}>
                <CreditCard />
                Оплата
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                Настройки
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Выйти
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => router.push('/login')}>
            <LogOut />
            Войти
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
