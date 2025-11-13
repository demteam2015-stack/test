'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart,
  BrainCircuit,
  CreditCard,
  Inbox,
  Users,
  BookUser,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { getUnreadMessagesCountForUser } from '@/lib/messages-api';
import { useEffect, useState } from 'react';

const subNavigation = {
    team: [
        { name: 'Состав команды', href: '/dashboard/team' },
        { name: 'Журнал посещаемости', href: '/dashboard/journal', roles: ['admin', 'coach'] },
    ],
    reports: [
        { name: 'Общая статистика', href: '/dashboard/reports', roles: ['admin', 'coach']},
        { name: 'Моя посещаемость', href: '/dashboard/reports', roles: ['athlete']},
        { name: 'Отчеты ребенка', href: '/dashboard/my-reports', roles: ['parent']},
    ],
    profile: [
        { name: 'Мой путь', href: '/dashboard/profile' },
        { name: 'Рекомендации', href: '/dashboard/my-messages', roles:['parent', 'athlete']},
        { name: 'Входящие', href: '/dashboard/recommendations', roles: ['admin', 'coach']},
    ],
    admin: [
        { name: 'Управление пользователями', href: '/dashboard/users' },
        { name: 'Платежи', href: '/dashboard/payments' },
    ]
}


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

  const getSubNav = () => {
      if (pathname.startsWith('/dashboard/team') || pathname.startsWith('/dashboard/journal')) return subNavigation.team;
      if (pathname.startsWith('/dashboard/reports') || pathname.startsWith('/dashboard/my-reports')) return subNavigation.reports;
      if (pathname.startsWith('/dashboard/profile') || pathname.startsWith('/dashboard/my-messages') || pathname.startsWith('/dashboard/recommendations')) return subNavigation.profile;
      if (pathname.startsWith('/dashboard/users') || pathname.startsWith('/dashboard/payments')) return subNavigation.admin;
      return [];
  }

  const currentSubNav = getSubNav();

  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      {currentSubNav.map((item) => {
        if (item.roles && !item.roles.includes(user.role)) return null;

        const isUnread = (item.href === '/dashboard/my-messages' || item.href === '/dashboard/recommendations') && unreadCount > 0;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'transition-colors hover:text-foreground relative',
              pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {item.name}
             {isUnread && (
                <span className="absolute top-[-2px] right-[-14px] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{unreadCount}</span>
             )}
          </Link>
        )
      })}
    </nav>
  );
}
