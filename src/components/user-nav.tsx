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
import { CreditCard, LogOut, Settings, User as UserIcon, Shield, Repeat, BadgeCheck, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, type UserProfile } from '@/context/auth-context';
import { getFullName, getInitials, getAvatarUrl } from '@/lib/utils';


export function UserNav() {
  const router = useRouter();
  const { user, logout, updateUser, isAdmin } = useAuth();

  const handleSignOut = () => {
    logout();
  };
  
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
          setTimeout(() => window.location.reload(), 100);
      }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
           <Avatar className="h-9 w-9">
              <AvatarImage
                src={user.photoURL ?? getAvatarUrl(user.id, user.username)}
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
                <p className="text-sm font-medium leading-none flex items-center gap-2">
                  {getFullName(user.firstName, user.lastName)}
                  {user.role === 'admin' && <BadgeCheck className="h-4 w-4 text-primary" />}
                  {user.role === 'coach' && <ShieldCheck className="h-4 w-4 text-blue-500" />}
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
