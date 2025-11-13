'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award,
  Calendar,
  CreditCard,
  Home,
  Trophy,
  MessageSquare,
  BookUser,
  Users,
  BarChart,
  User,
  GraduationCap,
  Inbox,
  Mail,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { getUnreadMessagesCountForUser } from '@/lib/messages-api';

export default function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isManager = user?.role === 'admin' || user?.role === 'coach';

  useEffect(() => {
    if (user) {
        const fetchCount = async () => {
            const count = await getUnreadMessagesCountForUser(user.id);
            setUnreadCount(count);
        }
        fetchCount();
        // Poll for new messages every 30 seconds
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }
  }, [user, pathname]); // Rerun when path changes to mark as read

  const navLinks = [
    { href: '/dashboard', label: 'Панель', icon: Home, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/profile', label: 'Профиль', icon: User, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/schedule', label: 'Расписание', icon: Calendar, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/team', label: 'Команда', icon: Users, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/journal', label: 'Журнал', icon: BookUser, roles: ['admin', 'coach'] },
    { href: '/dashboard/reports', label: 'Отчеты', icon: BarChart, roles: ['admin', 'coach', 'athlete', 'parent'] },
    { href: '/dashboard/education', label: 'Обучение', icon: GraduationCap, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { 
      href: '/dashboard/recommendations', 
      label: 'Новое сообщение', 
      icon: MessageSquare, 
      roles: ['parent', 'athlete'],
    },
    { 
      href: '/dashboard/recommendations', 
      label: 'Сообщения', 
      icon: Inbox, 
      roles: ['admin', 'coach'],
      badge: unreadCount,
    },
    { 
      href: '/dashboard/my-messages', 
      label: 'Мои сообщения', 
      icon: Mail, 
      roles: ['parent', 'athlete'],
      badge: unreadCount,
    },
    { href: '/dashboard/payments', label: 'Платежи', icon: CreditCard, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/competitions', label: 'Соревнования', icon: Trophy, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/hall-of-fame', label: 'Зал славы', icon: Award, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/users', label: 'Администрирование', icon: Users, roles: ['admin'] },
  ];

  if (!user) return null;

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <span className="text-lg font-semibold font-headline">Центр команды</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.filter(link => link.roles.includes(user.role)).map((link) => (
            <SidebarMenuItem key={link.href + link.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={{ children: link.label, side:'right', align: 'center'}}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                   {link.badge && link.badge > 0 && (
                      <SidebarMenuBadge>{link.badge}</SidebarMenuBadge>
                   )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" />
        <p className="px-3 text-xs text-muted-foreground">
          © Команда Демьяненко
        </p>
      </SidebarFooter>
    </>
  );
}
