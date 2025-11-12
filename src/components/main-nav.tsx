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
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';

export default function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isManager = user?.role === 'admin' || user?.role === 'coach';

  const navLinks = [
    { href: '/dashboard', label: 'Панель', icon: Home, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/profile', label: 'Профиль', icon: User, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/schedule', label: 'Расписание', icon: Calendar, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/team', label: 'Команда', icon: Users, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/journal', label: 'Журнал', icon: BookUser, roles: ['admin', 'coach'] },
    { href: '/dashboard/reports', label: 'Отчеты', icon: BarChart, roles: ['admin', 'coach', 'athlete', 'parent'] },
    { href: '/dashboard/education', label: 'Обучение', icon: GraduationCap, roles: ['admin', 'coach', 'parent', 'athlete'] },
    { href: '/dashboard/recommendations', label: 'Чат с тренером', icon: MessageSquare, roles: ['admin', 'coach', 'parent', 'athlete'] },
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
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={{ children: link.label, side:'right', align: 'center'}}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
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
