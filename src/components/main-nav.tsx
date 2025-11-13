'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award,
  Calendar,
  CreditCard,
  Home,
  Trophy,
  BookUser,
  Users,
  BarChart,
  User,
  GraduationCap,
  Inbox,
  BrainCircuit,
  MoreHorizontal,
} from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { getUnreadMessagesCountForUser } from '@/lib/messages-api';
import { cn } from '@/lib/utils';

export default function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (user) {
        const fetchCount = async () => {
            const count = await getUnreadMessagesCountForUser(user.id);
            setUnreadCount(count);
        }
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }
  }, [user, pathname]);

  if (!user) return null;

  const mainLinks = [
    { href: '/dashboard', label: 'Панель', icon: Home, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/profile', label: 'Мой путь', icon: User, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/schedule', label: 'Расписание', icon: Calendar, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/team', label: 'Команда', icon: Users, roles: ['admin', 'coach', 'parent', 'athlete'] },
  ];
  
  const coachLinks = [
    { href: '/dashboard/journal', label: 'Журнал', icon: BookUser, roles: ['admin', 'coach'] },
    { 
      href: '/dashboard/reports', 
      label: 'Отчеты', 
      icon: BarChart, 
      roles: ['admin', 'coach'] 
    },
    { 
      href: '/dashboard/messages', 
      label: 'Сообщения', 
      icon: Inbox, 
      roles: ['admin', 'coach'],
      badge: unreadCount,
    },
     { href: '/dashboard/users', label: 'Админ', icon: Users, roles: ['admin'] },
  ];
  
  const athleteParentLinks = [
      { 
      href: '/dashboard/reports', 
      label: 'Моя посещаемость', 
      icon: BarChart, 
      roles: ['athlete']
    },
    { 
      href: '/dashboard/my-reports', 
      label: 'Отчеты ребенка', 
      icon: BarChart, 
      roles: ['parent'] 
    },
      { 
      href: '/dashboard/my-messages', 
      label: 'Рекомендации', 
      icon: BrainCircuit, 
      roles: ['parent', 'athlete'],
      badge: unreadCount,
    },
  ];

  const commonLinks = [
    { href: '/dashboard/education', label: 'Обучение', icon: GraduationCap, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/payments', label: 'Платежи', icon: CreditCard, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/competitions', label: 'Соревнования', icon: Trophy, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/hall-of-fame', label: 'Зал славы', icon: Award, roles: ['admin', 'coach', 'parent', 'athlete'] },
  ];

  const NavLink = ({ href, label, isActive }: { href: string; label: string; isActive: boolean }) => (
    <Link href={href} legacyBehavior passHref>
      <a className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-muted-foreground"
      )}>
        {label}
      </a>
    </Link>
  );

  return (
    <Menubar className="border-none bg-transparent shadow-none p-0 gap-6 hidden md:flex">
      {mainLinks.filter(link => link.roles.includes(user.role)).map(link => (
        <MenubarMenu key={link.href}>
          <NavLink href={link.href} label={link.label} isActive={pathname === link.href}/>
        </MenubarMenu>
      ))}
      
       {user.role === 'admin' || user.role === 'coach' ? (
         <MenubarMenu>
            <MenubarTrigger className="p-0 text-sm font-medium transition-colors text-muted-foreground hover:text-primary data-[state=open]:text-primary cursor-pointer">Тренер</MenubarTrigger>
             <MenubarContent>
               {coachLinks.filter(link => link.roles.includes(user.role)).map(link => (
                <MenubarItem key={link.href} asChild>
                   <Link href={link.href} className="flex items-center justify-between w-full">
                        {link.label}
                        {link.badge && link.badge > 0 && <Badge variant="secondary">{link.badge}</Badge>}
                   </Link>
                </MenubarItem>
               ))}
            </MenubarContent>
         </MenubarMenu>
       ) : (
          athleteParentLinks.filter(link => link.roles.includes(user.role)).map(link => (
            <MenubarMenu key={link.href}>
              <Link href={link.href} legacyBehavior passHref>
                <a className={cn(
                    "relative text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}>
                  {link.label}
                  {link.badge && link.badge > 0 && <span className="absolute top-[-5px] right-[-10px] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{link.badge}</span>}
                </a>
              </Link>
            </MenubarMenu>
          ))
       )}
      
      <MenubarMenu>
        <MenubarTrigger className="p-0 text-sm font-medium transition-colors text-muted-foreground hover:text-primary data-[state=open]:text-primary cursor-pointer">Еще</MenubarTrigger>
        <MenubarContent>
           {commonLinks.filter(link => link.roles.includes(user.role)).map(link => (
                <MenubarItem key={link.href} asChild><Link href={link.href}>{link.label}</Link></MenubarItem>
           ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
