'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award,
  BrainCircuit,
  Calendar,
  CreditCard,
  Home,
  Trophy,
  Users,
  ShieldCheck,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { useUserProfile } from '@/firebase';

const allLinks = [
  { href: '/dashboard', label: 'Панель', icon: Home, roles: ['athlete', 'coach', 'parent', 'admin'] },
  { href: '/dashboard/schedule', label: 'Расписание', icon: Calendar, roles: ['athlete', 'coach', 'parent'] },
  { href: '/dashboard/recommendations', label: 'AI Тренер', icon: BrainCircuit, roles: ['athlete', 'coach'] },
  { href: '/dashboard/payments', label: 'Платежи', icon: CreditCard, roles: ['athlete', 'parent'] },
  { href: '/dashboard/competitions', label: 'Соревнования', icon: Trophy, roles: ['athlete', 'coach', 'parent'] },
  { href: '/dashboard/hall-of-fame', label: 'Зал славы', icon: Award, roles: ['athlete', 'coach', 'parent', 'admin'] },
  { href: '/dashboard/users', label: 'Пользователи', icon: Users, roles: ['admin'] },
  { href: '/dashboard/admin-panel', label: 'Админ-панель', icon: ShieldCheck, roles: ['admin'] },
];

export default function MainNav() {
  const pathname = usePathname();
  const { data: userProfile, isLoading } = useUserProfile();

  const userRole = userProfile?.role || null;

  const links = allLinks.filter(link => userRole && link.roles.includes(userRole));

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
          {isLoading ? (
            <>
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </>
          ) : (
            links.map((link) => (
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
            ))
          )}
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
