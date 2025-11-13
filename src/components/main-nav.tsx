'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart,
  Home,
  Users,
  Calendar,
  Trophy,
  GraduationCap,
  Award,
  ShieldCheck,
  User,
  BookUser,
  BrainCircuit,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const mainNavLinks = [
  { href: '/dashboard', label: 'Панель', icon: Home, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/profile', label: 'Профиль', icon: User, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/team', label: 'Команда', icon: Users, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/schedule', label: 'Расписание', icon: Calendar, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/journal', label: 'Журнал', icon: BookUser, roles: ['admin', 'coach'] },
  { href: '/dashboard/competitions', label: 'Соревнования', icon: Trophy, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/education', label: 'Обучение', icon: GraduationCap, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/hall-of-fame', label: 'Зал славы', icon: Award, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/attestation', label: 'Аттестация', icon: ShieldCheck, roles: ['admin', 'coach']},
  { href: '/dashboard/reports', label: 'Отчеты', icon: BarChart, roles: ['admin', 'coach', 'athlete']},
  { href: '/dashboard/my-reports', label: 'Мои Отчеты', icon: BarChart, roles: ['parent']},
  { href: '/dashboard/payments', label: 'Платежи', icon: CreditCard, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/my-messages', label: 'Рекомендации', icon: BrainCircuit, roles: ['parent', 'athlete'] },
  { href: '/dashboard/recommendations', label: 'Сообщения', icon: BrainCircuit, roles: ['admin', 'coach'] },
];


export default function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      {mainNavLinks.map((item) => {
        if (item.roles && !item.roles.includes(user.role)) return null;

        const Icon = item.icon;
        const isActive = (pathname.startsWith(item.href) && item.href !== '/dashboard') || pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'transition-colors hover:text-foreground relative flex items-center gap-2',
              isActive ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  );
}
